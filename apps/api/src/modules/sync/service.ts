import { kitsuPage, kitsuRecentPage, toMediaRow } from "@tsuki/kitsu";
import { db, isNull, lt, mediaDal, ne, or, syncState } from "@tsuki/db";

import type { MediaType } from "../media/model";

/**
 * Catalogue sync engine (ADR 0004), two walks:
 *
 * - Incremental (nightly cron, /admin/sync/tick-cron): fetches pages with
 *   sort=-updatedAt (verified against kitsu.app/api/edge) and stops once a
 *   page's oldest row is no newer than the pass's watermark. A daily pass
 *   only re-walks recently-updated media, so it fits in a few 40s ticks.
 * - Bootstrap (full walk from offset 0): the default tick mode and the
 *   `scripts/sync-bootstrap.ts` path. ~2,500 pages of 20 per type cannot fit
 *   in one invocation — call `resetSync` once, then invoke the tick
 *   (script or route) repeatedly until it reports done for both types.
 *
 * Either way a Vercel cron invocation resumes where the last one left off via
 * the sync_state row's cursor.
 *
 * Watermark (sync_state.watermark, an ISO instant): rows with a Kitsu
 * updatedAt newer than it are the only ones worth upserting. A fresh pass
 * derives it from the media table's max(updated_at) — our last write, the
 * previous pass's coverage ceiling — captures the walk's newest updatedAt
 * before its first upsert, and promotes that on completion. An interrupted
 * pass resumes against the stored boundary, so it stops where the original
 * pass would have.
 *
 * Bulk pages carry no `included` in bootstrap mode, so genres/links/trailer
 * arrive null and upsertMedia COALESCEs them against the stored value;
 * incremental pages include them, keeping crawled rows detail-complete.
 */

const PAGE_SIZE = 20;
const PAGE_DELAY_MS = 250;
const TIME_BOX_MS = 40_000;
/** A "running" state older than this is a dead invocation, not a competitor. */
const RUNNING_GRACE_MS = 5 * 60_000;

export type TickResult = {
  done: boolean;
  status: "idle" | "running" | "failed";
  /** Cumulative rows upserted across the whole run (persisted in the cursor). */
  upserted: number;
  /** Next crawl position; null once the walk is exhausted. */
  nextOffset: number | null;
  /** Set when the tick threw (per-type failure surfaced by the cron route). */
  error?: string;
};

type StatePatch = Partial<typeof syncState.$inferInsert>;

async function writeState(mediaType: MediaType, patch: StatePatch) {
  await db
    .insert(syncState)
    .values({ id: mediaType, ...patch })
    .onConflictDoUpdate({ target: syncState.id, set: patch });
}

/** Clears the cursor (and boundary) so the next tick starts a fresh crawl. */
export async function resetSync(mediaType: MediaType) {
  await writeState(mediaType, { status: "idle", cursor: null, error: null, watermark: null });
}

export async function getSyncStates() {
  return db.select().from(syncState);
}

export type TickOptions = {
  /** Skip the claim. Only safe for a single local writer. */
  force?: boolean;
  /** Newest-first walk that stops at the pass's watermark. */
  incremental?: boolean;
};

/**
 * Atomically claims the crawl for one type: a single INSERT … ON CONFLICT DO
 * UPDATE whose WHERE excludes a live "running" holder, so concurrent
 * invocations cannot both pass. A missing row is created with status "idle".
 * Returns the claimed state, or null when another writer holds the crawl.
 */
export async function claimSync(mediaType: MediaType) {
  const now = new Date();
  const [claimed] = await db
    .insert(syncState)
    // The insert values carry the claim too: a row created concurrently is
    // already "running", so the conflict re-eval rejects the second claimant.
    .values({ id: mediaType, status: "running", cursorUpdatedAt: now })
    .onConflictDoUpdate({
      target: syncState.id,
      set: { status: "running", cursorUpdatedAt: now, error: null },
      setWhere: or(
        ne(syncState.status, "running"),
        isNull(syncState.cursorUpdatedAt),
        lt(syncState.cursorUpdatedAt, new Date(Date.now() - RUNNING_GRACE_MS)),
      ),
    })
    .returning();
  return claimed ?? null;
}

/**
 * The media table's own newest updatedAt — the previous pass's coverage
 * ceiling. Later ISO instants sort after earlier ones, so the walk compares
 * Kitsu's updatedAt strings against this directly.
 */
async function readWatermark(mediaType: MediaType): Promise<string | null> {
  const { rows } = await db.execute(
    // epoch×1000 as a number: neon-http's JSON round-trip mangles timestamptz.
    // ponytail: one unindexed max(updated_at) scan per nightly tick — add a
    // (type, updated_at) index if the tick ever feels it. mediaType is
    // enum-bound (MediaType), not user input — interpolation is safe here.
    `select coalesce(extract(epoch from max(updated_at)) * 1000, 0) as watermark from media where type = '${mediaType}'`,
  );
  const ms = Number(rows[0]?.watermark ?? 0);
  return ms > 0 ? new Date(ms).toISOString() : null;
}

/** The later of two watermarks — promotion must never move coverage backwards. */
const laterWatermark = (a: string | null, b: string | null) => (!a || (b && b > a) ? b : a);

export async function runSyncTick(
  mediaType: MediaType,
  { force = false, incremental = false }: TickOptions = {},
): Promise<TickResult> {
  let state: typeof syncState.$inferSelect | null | undefined;

  if (force) {
    // Single local writer: read the state and take the run.
    state = (await db.select().from(syncState)).find((row) => row.id === mediaType);
  } else {
    state = await claimSync(mediaType);
    if (!state) {
      // Another invocation holds the crawl and is alive.
      const current = (await db.select().from(syncState)).find((row) => row.id === mediaType);
      return {
        done: false,
        status: "running",
        upserted: 0,
        nextOffset: current?.cursor?.offset ?? 0,
      };
    }
  }

  // Stale "running" (dead invocation) and "failed" resume from the cursor;
  // only a null cursor starts a fresh run.
  const fresh = !state?.cursor;
  const cursor = state?.cursor ?? { offset: 0, upserted: 0 };
  const now = new Date();

  // Stop boundary: a fresh pass derives it from our table (our last write =
  // the previous pass's coverage ceiling); a resumed pass keeps the stored
  // boundary — the ORIGINAL one, not one shifted forward by this pass's own
  // upserts. Persisted by the start write below so any resume sees it.
  const watermark = incremental
    ? fresh || !state?.watermark
      ? await readWatermark(mediaType)
      : state.watermark
    : null;

  await writeState(mediaType, {
    status: "running",
    runStartedAt: fresh ? now : (state?.runStartedAt ?? now),
    cursor,
    cursorUpdatedAt: now,
    error: null,
    ...(incremental ? { watermark } : {}),
  });

  const deadline = Date.now() + TIME_BOX_MS;
  let { offset, upserted } = { offset: cursor.offset, upserted: cursor.upserted ?? 0 };

  // Newest Kitsu updatedAt this pass started from — the completion's promotion
  // candidate. Captured before the first upsert, never re-derived on resume
  // (a resumed pass has no page 0, so completion promotes the stored boundary;
  // the next pass then re-walks rows updated mid-pass. Over-fetch, never loss).
  let passWatermark: string | null = null;
  const fetchPage = incremental ? kitsuRecentPage : kitsuPage;

  try {
    for (;;) {
      if (Date.now() >= deadline) {
        await writeState(mediaType, { cursor: { offset, upserted }, cursorUpdatedAt: new Date() });
        return { done: false, status: "running", upserted, nextOffset: offset };
      }

      const page = await fetchPage(mediaType, offset, PAGE_SIZE);
      if (incremental && offset === 0) {
        passWatermark = page.data[0]?.attributes?.updatedAt ?? null;
      }
      await mediaDal.upsertMedia(page.data.map((item) => toMediaRow(item, page.included)));

      offset += PAGE_SIZE;
      upserted += page.data.length;

      const total = page.meta?.count;
      // Incremental pages sort newest-first, so once the oldest row on a page
      // stops being newer than the watermark, every later page is stale too.
      const oldest = page.data.at(-1)?.attributes?.updatedAt;
      const caughtUp =
        page.data.length === 0 ||
        (typeof total === "number" && offset >= total) ||
        (watermark !== null && oldest != null && new Date(oldest) <= new Date(watermark));

      if (caughtUp) {
        await writeState(mediaType, {
          status: "idle",
          cursor: null,
          cursorUpdatedAt: new Date(),
          lastCompletedAt: new Date(),
          error: null,
          // Incremental passes promote the boundary; bootstrap passes clear it
          // so the next incremental pass re-derives from the fresh table.
          watermark: incremental ? laterWatermark(passWatermark, watermark) : null,
        });
        return { done: true, status: "idle", upserted, nextOffset: null };
      }

      await new Promise((resolve) => setTimeout(resolve, PAGE_DELAY_MS));
    }
  } catch (error) {
    // Keep the cursor: the next tick resumes at the failing page.
    await writeState(mediaType, {
      status: "failed",
      cursor: { offset, upserted },
      cursorUpdatedAt: new Date(),
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}
