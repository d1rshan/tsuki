/**
 * Phase 4 — migrates the media catalogue + user data from AniList ids to
 * Kitsu ids (docs/adr/0004-own-media-catalogue.md).
 *
 * IMPORTANT: run BEFORE sync-bootstrap.ts — until the old AniList-keyed rows
 * are gone, Kitsu ids would collide with them.
 *
 * Usage (cwd: apps/api):
 *   bun run scripts/migrate-media-ids.ts           # dry run, prints a plan
 *   bun run scripts/migrate-media-ids.ts --apply   # executes the migration
 *
 * Talks to Kitsu and Postgres directly, no API process needed. Re-runnable:
 * every step is idempotent and partial failures leave old rows in place for
 * the next run to retry.
 *
 * Why it's safe against real user data:
 * - Old rows with no Kitsu mapping are left untouched, never deleted.
 * - FKs are remapped with one set-based UPDATE per chunk. Postgres matches
 *   each row once against the pre-statement snapshot, so crosswalk cycles
 *   (an old id that is also another row's kitsu target) resolve atomically —
 *   no per-row ordering hazards.
 * - library/reviews FKs are ON DELETE CASCADE, so a media row is deleted only
 *   after zero library/reviews/activity rows still reference it. Rows whose
 *   remap hit a per-user collision stay alive and get reported.
 * - activity has no FK to media (mediaId is nullable), so orphans are caught
 *   by post-validation instead of a constraint.
 * - sourceId rewrites: LOG is "<mediaId>:<yyyy-mm-dd>" (library service
 *   logSourceId); REVIEW is String(mediaId) (reviews service upsertActivity).
 *   Both are remapped, not just LOG.
 */
import { db, media, library, reviews, activity, mediaDal, sql } from "@tsuki/db";
import type { MediaType } from "@tsuki/db";
import { kitsuMediaById, kitsuRequest, type MediaRow } from "@tsuki/kitsu";

const APPLY = process.argv.includes("--apply");

const SITE: Record<MediaType, string> = { ANIME: "anilist/anime", MANGA: "anilist/manga" };
const ITEM_TYPE: Record<MediaType, string> = { ANIME: "anime", MANGA: "manga" };

/** Kitsu is a free public API — conservative pacing throughout. */
const CONCURRENCY = 3;
const PACE_MS = 250;
const MAPPING_BATCH = 20; // Kitsu caps page size at 20
const SQL_CHUNK = 1000;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Fixed-order worker pool; each worker paces after every item. */
async function pool<T, R>(items: T[], fn: (item: T) => Promise<R>) {
  const results: R[] = new Array(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, items.length) }, async () => {
      for (;;) {
        const i = next++;
        const item = items[i];
        if (i >= items.length || item === undefined) return;
        results[i] = await fn(item);
        await sleep(PACE_MS);
      }
    }),
  );
  return results;
}

const titleOf = (row: {
  titleRomaji: string | null;
  titleEnglish: string | null;
  titleNative: string | null;
}) => row.titleEnglish ?? row.titleRomaji ?? row.titleNative ?? "(untitled)";

// ---------------------------------------------------------------------------
// 1. Load old rows
// ---------------------------------------------------------------------------

const oldRows = await db
  .select({
    id: media.id,
    type: media.type,
    titleRomaji: media.titleRomaji,
    titleEnglish: media.titleEnglish,
    titleNative: media.titleNative,
  })
  .from(media);

console.log(`[load] media rows: ${oldRows.length}`);

const typeById = new Map(oldRows.map((row) => [row.id, row.type] as const));

/** Distinct (mediaId, mediaType) pairs a table references. */
const distinctRefs = async (table: typeof library | typeof reviews | typeof activity) =>
  db
    .selectDistinct({ mediaId: table.mediaId, mediaType: table.mediaType })
    .from(table)
    .where(sql`${table.mediaId} is not null`);

const [libraryRefs, reviewRefs, activityRefs] = await Promise.all([
  distinctRefs(library),
  distinctRefs(reviews),
  distinctRefs(activity),
]);
console.log(
  `[load] referenced (id, type) pairs — library: ${libraryRefs.length}, reviews: ${reviewRefs.length}, activity: ${activityRefs.length}`,
);

// ---------------------------------------------------------------------------
// 2. Crosswalk: Kitsu mappings endpoint (batched, include=item)
// ---------------------------------------------------------------------------

type ItemData = { id: string; type: string };
type MappingPage = {
  data: {
    id: string;
    attributes: { externalId: string };
    relationships?: { item?: { data?: ItemData | ItemData[] | null } };
  }[];
};

/** Single-item fallback when a batch response omits relationship data. */
async function resolveSingleMapping(type: MediaType, oldId: number): Promise<string | null> {
  const page = await kitsuRequest<MappingPage>("/mappings", {
    "filter[externalSite]": SITE[type],
    "filter[externalId]": oldId,
    include: "item",
    "page[limit]": MAPPING_BATCH,
  });

  const data = page.data[0]?.relationships?.item?.data;
  const single = Array.isArray(data) ? (data.length === 1 ? data[0] : null) : (data ?? null);
  if (!single) return null;
  if (single.type !== ITEM_TYPE[type]) {
    console.error(
      `[crosswalk] ${type} ${oldId}: item type "${single.type}" ≠ expected "${ITEM_TYPE[type]}"`,
    );
    return null;
  }
  return single.id;
}

/** Resolves a batch of old ids to kitsu ids (null = unresolved). */
async function resolveBatch(type: MediaType, ids: number[]) {
  const page = await kitsuRequest<MappingPage>("/mappings", {
    "filter[externalSite]": SITE[type],
    "filter[externalId]": ids.join(","),
    include: "item",
    "page[limit]": MAPPING_BATCH,
  });

  const relationshipData = new Map<string, ItemData | ItemData[] | null | undefined>();
  for (const mapping of page.data) {
    relationshipData.set(mapping.attributes.externalId, mapping.relationships?.item?.data);
  }

  const out = new Map<number, string | null>();
  for (const id of ids) {
    const data = relationshipData.get(String(id));
    const single = Array.isArray(data) ? (data.length === 1 ? data[0] : null) : (data ?? null);

    if (single && single.type === ITEM_TYPE[type]) {
      out.set(id, single.id);
    } else if (single) {
      console.error(
        `[crosswalk] ${type} ${id}: item type "${single.type}" ≠ expected "${ITEM_TYPE[type]}"`,
      );
      out.set(id, null);
    } else if (Array.isArray(data)) {
      console.error(`[crosswalk] ${type} ${id}: ambiguous multi-item relationship`);
      out.set(id, null);
    } else {
      // Relationship data absent on the list response — per-mapping fallback
      // handles the defensively-handled shape.
      try {
        out.set(id, await resolveSingleMapping(type, id));
      } catch (error) {
        console.error(`[crosswalk] ${type} ${id}: ${(error as Error).message}`);
        out.set(id, null);
      }
    }
  }
  return out;
}

const byType: Record<MediaType, typeof oldRows> = { ANIME: [], MANGA: [] };
for (const row of oldRows) byType[row.type].push(row);

const crosswalk = new Map<number, number>(); // oldId -> kitsuId

for (const type of ["ANIME", "MANGA"] as const) {
  const rows = byType[type];
  const chunks: (typeof rows)[] = [];
  for (let i = 0; i < rows.length; i += MAPPING_BATCH)
    chunks.push(rows.slice(i, i + MAPPING_BATCH));

  console.log(`[crosswalk] ${type}: ${rows.length} rows, ${chunks.length} batched queries`);

  const resolved = await pool(chunks, async (chunk) => {
    const ids = chunk.map((row) => row.id);
    try {
      return await resolveBatch(type, ids);
    } catch (error) {
      console.error(`[crosswalk] batch [${ids.join(",")}]: ${(error as Error).message}`);
      return new Map<number, string | null>(ids.map((id) => [id, null]));
    }
  });

  for (const chunk of resolved) {
    for (const [oldId, kitsuId] of chunk) {
      if (kitsuId) crosswalk.set(oldId, Number(kitsuId));
    }
  }
}

console.log(
  `[crosswalk] resolved: ${crosswalk.size}, unresolved: ${oldRows.length - crosswalk.size}`,
);

// Two old rows claiming the same kitsu id would collapse distinct shows into
// one — keep the first, treat the rest as unresolved.
const seenTargets = new Set<number>();
for (const [oldId, kitsuId] of crosswalk) {
  if (seenTargets.has(kitsuId)) {
    console.error(
      `[crosswalk] duplicate target ${kitsuId} (old id ${oldId}) — treated as unresolved`,
    );
    crosswalk.delete(oldId);
  }
  seenTargets.add(kitsuId);
}

// ---------------------------------------------------------------------------
// 3. Collision precheck
// ---------------------------------------------------------------------------

type MapEntry = { oldId: number; type: MediaType; kitsuId: number };

/** Self-mappings (old id == its own kitsu id) need no FK remap — the row is
 * already at its kitsu id and just gets a data refresh. */
const selfMapped = new Set<number>();
for (const [oldId, kitsuId] of crosswalk) if (oldId === kitsuId) selfMapped.add(oldId);

const remapEntries: MapEntry[] = [];
for (const [oldId, kitsuId] of crosswalk) {
  if (!selfMapped.has(oldId)) remapEntries.push({ oldId, type: typeById.get(oldId)!, kitsuId });
}

const targetIds = [...new Set(remapEntries.map((entry) => entry.kitsuId))];

const existingTargets =
  targetIds.length > 0
    ? await db
        .select({ id: media.id, type: media.type })
        .from(media)
        .where(sql`${media.id} = any(${sql.raw(`array[${targetIds.join(",")}]::int[]`)})`)
    : [];
const existingType = new Map(existingTargets.map((row) => [row.id, row.type]));

// A target row of a different type would corrupt the composite FKs — exclude
// the row loudly instead of remapping onto the wrong media kind.
const typeMismatches: MapEntry[] = [];
const entries = remapEntries.filter((entry) => {
  const existing = existingType.get(entry.kitsuId);
  if (existing && existing !== entry.type) {
    typeMismatches.push(entry);
    console.error(
      `[precheck] ${entry.type} ${entry.oldId} → kitsu ${entry.kitsuId}: target row exists as ${existing} — skipping`,
    );
    return false;
  }
  return true;
});

// ---------------------------------------------------------------------------
// 4. Apply: prefetch kitsu rows, then upsert / remap / delete
// ---------------------------------------------------------------------------

const kitsuRows = new Map<number, MediaRow | null>(); // kitsu id -> row (null = fetch failed)
const upsertTypes = new Map<number, MediaType>(); // kitsu id -> media type

if (APPLY && entries.length + selfMapped.size > 0) {
  const fetchIds = [...new Set([...entries.map((entry) => entry.kitsuId), ...selfMapped])];
  console.log(
    `[kitsu] fetching ${fetchIds.length} media documents (x${CONCURRENCY}, ${PACE_MS}ms pacing)`,
  );

  const fetched = await pool(fetchIds, async (id) => {
    // Every target id was type-checked against exactly one media kind above.
    const type = entries.find((entry) => entry.kitsuId === id)?.type ?? typeById.get(id) ?? "ANIME";
    try {
      return [id, await kitsuMediaById(type, id)] as const;
    } catch (error) {
      console.error(`[kitsu] ${type} ${id}: ${(error as Error).message}`);
      return [id, null] as const;
    }
  });

  for (const [id, row] of fetched) kitsuRows.set(id, row);
  console.log(`[kitsu] fetched ok: ${fetched.filter(([, row]) => row).length}/${fetched.length}`);

  // Rows whose kitsu document failed to fetch are excluded from the whole
  // migration (old row + user data left untouched, retried next run).
  for (let i = entries.length - 1; i >= 0; i--) {
    const entry = entries[i];
    if (entry === undefined || !kitsuRows.get(entry.kitsuId)) entries.splice(i, 1);
  }
  for (const id of [...selfMapped]) {
    if (!kitsuRows.get(id)) selfMapped.delete(id);
  }
}

/** Full working set: upsert data at kitsu ids, remap FKs old→kitsu, delete old. */
const plan: MapEntry[] = [
  ...entries,
  ...[...selfMapped].map((id) => ({ oldId: id, type: typeById.get(id)!, kitsuId: id })),
];

// ---------------------------------------------------------------------------
// Plan (dry run) / report
// ---------------------------------------------------------------------------

const plannedRemapCounts = async (tableName: string) => {
  let total = 0;
  for (let i = 0; i < entries.length; i += SQL_CHUNK) {
    const values = entries
      .slice(i, i + SQL_CHUNK)
      .map((entry) => `(${entry.oldId},${entry.kitsuId},'${entry.type}')`)
      .join(",");
    const { rows } = await db.execute<{ count: string }>(
      sql.raw(
        `select count(*)::text as count from ${tableName} t
         join (values ${values}) as m(old_id, k, mtype)
           on t.media_id = m.old_id and t.media_type::text = m.mtype`,
      ),
    );
    total += Number(rows[0]?.count ?? 0);
  }
  return total;
};

const unresolvedRows = oldRows.filter((row) => !crosswalk.has(row.id) && !selfMapped.has(row.id));

if (!APPLY) {
  console.log("\n=== DRY RUN (no writes — pass --apply to execute) ===");
  console.log(`old media rows:          ${oldRows.length}`);
  console.log(
    `resolved:                ${crosswalk.size} (remap: ${entries.length}, self-mapped: ${selfMapped.size})`,
  );
  console.log(`unresolved:              ${unresolvedRows.length}`);
  console.log(`type mismatches skipped: ${typeMismatches.length}`);
  console.log(`library rows to remap:   ${await plannedRemapCounts("library")}`);
  console.log(`reviews rows to remap:   ${await plannedRemapCounts("reviews")}`);
  console.log(`activity rows to remap:  ${await plannedRemapCounts("activity")}`);
  console.log("sample unresolved (up to 20):");
  for (const row of unresolvedRows.slice(0, 20))
    console.log(`  - ${row.id} [${row.type}] ${titleOf(row)}`);
  process.exit(0);
}

console.log("\n=== APPLY ===");

// a) Upsert kitsu rows first — the remap's FK targets must exist. Covers
// self-mapped refreshes and overwrites of colliding old rows alike.
for (let i = 0; i < plan.length; i += 100) {
  await mediaDal.upsertMedia(plan.slice(i, i + 100).map((entry) => kitsuRows.get(entry.kitsuId)!));
  console.log(`[upsert] ${Math.min(i + 100, plan.length)}/${plan.length}`);
}
console.log(`[upsert] done: ${plan.length} rows`);

// b) Set-based FK remaps, one guarded UPDATE per chunk per table. The
// NOT EXISTS guard skips users who already have a row at the target id (only
// possible via a partial previous run); those keep the old id, and the old
// media row stays alive for the next run.
const stats = {
  library: { remapped: 0, skipped: 0 },
  reviews: { remapped: 0, skipped: 0 },
  activity: { remapped: 0, skipped: 0 },
};

for (let i = 0; i < entries.length; i += SQL_CHUNK) {
  const chunk = entries.slice(i, i + SQL_CHUNK);
  const values = chunk
    .map((entry) => `(${entry.oldId},${entry.kitsuId},'${entry.type}')`)
    .join(",");

  /** One guarded UPDATE; returns [before, remapped] so skips are visible. */
  const remap = async (table: string, sets: string, guard: string) => {
    const before = await db.execute<{ count: string }>(
      sql.raw(
        `select count(*)::text as count from ${table} t
         join (values ${values}) as m(old_id, k, mtype)
           on t.media_id = m.old_id and t.media_type::text = m.mtype`,
      ),
    );
    const updated = await db.execute<{ "1": number }>(
      sql.raw(
        `update ${table} t set ${sets}
         from (values ${values}) as m(old_id, k, mtype)
         where t.media_id = m.old_id and t.media_type::text = m.mtype ${guard}
         returning 1`,
      ),
    );
    return { before: Number(before.rows[0]?.count ?? 0), remapped: updated.rows.length };
  };

  const lib = await remap(
    "library",
    "media_id = m.k",
    "and not exists (select 1 from library l2 where l2.user_id = t.user_id and l2.media_id = m.k)",
  );
  stats.library.remapped += lib.remapped;
  stats.library.skipped += lib.before - lib.remapped;

  const rev = await remap(
    "reviews",
    "media_id = m.k",
    "and not exists (select 1 from reviews r2 where r2.user_id = t.user_id and r2.media_id = m.k)",
  );
  stats.reviews.remapped += rev.remapped;
  stats.reviews.skipped += rev.before - rev.remapped;

  // LOG sourceId is "<mediaId>:<yyyy-mm-dd>" — rewrite the id, keep the day.
  const log = await remap(
    "activity",
    "media_id = m.k, source_id = m.k::text || ':' || split_part(t.source_id, ':', 2)",
    `and t.type = 'LOG'
     and not exists (select 1 from activity a2 where a2.actor_id = t.actor_id and a2.type = 'LOG'
       and a2.source_id = m.k::text || ':' || split_part(t.source_id, ':', 2))`,
  );
  // REVIEW sourceId is String(mediaId) — plain rewrite (reviews service).
  const review = await remap(
    "activity",
    "media_id = m.k, source_id = m.k::text",
    `and t.type = 'REVIEW'
     and not exists (select 1 from activity a2 where a2.actor_id = t.actor_id and a2.type = 'REVIEW'
       and a2.source_id = m.k::text)`,
  );
  stats.activity.remapped += log.remapped + review.remapped;
  stats.activity.skipped += log.before + review.before - log.remapped - review.remapped;
}

console.log(
  `[remap] library: ${stats.library.remapped} (${stats.library.skipped} skipped), ` +
    `reviews: ${stats.reviews.remapped} (${stats.reviews.skipped} skipped), ` +
    `activity: ${stats.activity.remapped} (${stats.activity.skipped} skipped)`,
);

// c) Delete old rows — only once nothing references them. library/reviews
// FKs cascade (so the guard is what protects user data); activity isn't an
// enforced FK, hence the explicit check.
const oldIds = entries.map((entry) => entry.oldId);
let deleted = 0;
const kept: number[] = [];
for (let i = 0; i < oldIds.length; i += SQL_CHUNK) {
  const chunk = oldIds.slice(i, i + SQL_CHUNK);
  const { rows } = await db.execute<{ id: number }>(
    sql.raw(
      `delete from media as m
       using (values ${chunk.map((id) => `(${id})`).join(",")}) as v(id)
       where m.id = v.id
         and not exists (select 1 from library l where l.media_id = m.id)
         and not exists (select 1 from reviews r where r.media_id = m.id)
         and not exists (select 1 from activity a where a.media_id = m.id)
       returning m.id as id`,
    ),
  );
  deleted += rows.length;
  const gone = new Set(rows.map((row) => Number(row.id)));
  kept.push(...chunk.filter((id) => !gone.has(id)));
}
console.log(`[delete] old rows deleted: ${deleted}, kept (still referenced): ${kept.length}`);

// ---------------------------------------------------------------------------
// 5. Post-migration validation — fails loudly
// ---------------------------------------------------------------------------

console.log("\n=== VALIDATION ===");

const mediaCountResult = await db.execute<{ count: string }>(
  sql`select count(*)::text as count from media`,
);
const mediaCount = Number(mediaCountResult.rows[0]?.count ?? 0);
console.log(`media rows now:             ${mediaCount}`);
console.log(`migrated (old rows deleted): ${deleted}`);
console.log(`skipped unresolved:          ${unresolvedRows.length + typeMismatches.length}`);

/** Rows referencing a media id that doesn't exist — must be zero for all three tables. */
const orphans = async (table: string) => {
  const { rows } = await db.execute<{ count: string }>(
    sql.raw(
      `select count(*)::text as count from ${table} t
       left join media m on m.id = t.media_id
       where t.media_id is not null and m.id is null`,
    ),
  );
  return Number(rows[0]?.count ?? 0);
};

const orphanCounts = {
  library: await orphans("library"),
  reviews: await orphans("reviews"),
  activity: await orphans("activity"),
};
console.log(`orphaned FK rows: ${JSON.stringify(orphanCounts)}`);

if (orphanCounts.library || orphanCounts.reviews || orphanCounts.activity) {
  console.error("VALIDATION FAILED — rows reference media ids that no longer exist");
  process.exit(1);
}

console.log("\n=== UNRESOLVED OLD ROWS (left in place; user data untouched) ===");
if (unresolvedRows.length === 0) console.log("none — migration complete");
for (const row of unresolvedRows.slice(0, 100))
  console.log(`  - ${row.id} [${row.type}] ${titleOf(row)}`);
if (unresolvedRows.length > 100) console.log(`  … and ${unresolvedRows.length - 100} more`);

if (kept.length)
  console.log(`\nkept old rows (remap collision or partial failure): ${kept.join(", ")}`);
if (typeMismatches.length) {
  console.log(
    `type mismatches (skipped): ${typeMismatches.map((entry) => `${entry.oldId}→${entry.kitsuId}`).join(", ")}`,
  );
}

console.log("\nDONE. Re-run with --apply to retry anything left behind.");
