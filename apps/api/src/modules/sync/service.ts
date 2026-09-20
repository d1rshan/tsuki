import { kitsuPage, toMediaRow } from "@tsuki/kitsu";
import { db, mediaDal, syncState } from "@tsuki/db";

import type { MediaType } from "../media/model";

/**
 * Catalogue sync engine (ADR 0004): walks Kitsu's /anime and /manga collections
 * into the media table in time-boxed chunks, so a Vercel cron invocation can
 * resume where the last one left off via the sync_state row.
 *
 * Bootstrapping (~2,500 pages of 20 per type cannot fit in one invocation):
 * call `resetSync` once, then invoke the tick (cron or `scripts/
 * sync-bootstrap.ts`) repeatedly until it reports done for both types.
 *
 * Bulk pages carry no `included`, so genres/links/trailer arrive null and
 * upsertMedia COALESCEs them against the stored value — detail-level fields are
 * filled by the read-through path, which fetches them via kitsuMediaById.
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
};

type StatePatch = Partial<typeof syncState.$inferInsert>;

async function writeState(mediaType: MediaType, patch: StatePatch) {
  await db
    .insert(syncState)
    .values({ id: mediaType, ...patch })
    .onConflictDoUpdate({ target: syncState.id, set: patch });
}

/** Clears the cursor so the next tick starts a fresh full crawl. */
export async function resetSync(mediaType: MediaType) {
  await writeState(mediaType, { status: "idle", cursor: null, error: null });
}

export async function getSyncStates() {
  return db.select().from(syncState);
}

export type TickOptions = {
  /** Skip the already-running guard. Only safe for a single local writer. */
  force?: boolean;
};

export async function runSyncTick(
  mediaType: MediaType,
  { force = false }: TickOptions = {},
): Promise<TickResult> {
  // The table holds at most two rows — reading it whole and filtering in JS
  // skips a drizzle-orm dependency in the api app.
  const state = (await db.select().from(syncState)).find((row) => row.id === mediaType);

  // Idempotency guard: another invocation holds the crawl and is alive.
  if (
    !force &&
    state?.status === "running" &&
    state.cursorUpdatedAt &&
    Date.now() - state.cursorUpdatedAt.getTime() < RUNNING_GRACE_MS
  ) {
    return { done: false, status: "running", upserted: 0, nextOffset: state.cursor?.offset ?? 0 };
  }

  // Stale "running" (dead invocation) and "failed" resume from the cursor;
  // only a null cursor starts a fresh run.
  const fresh = !state?.cursor;
  const cursor = state?.cursor ?? { offset: 0, upserted: 0 };
  const now = new Date();

  await writeState(mediaType, {
    status: "running",
    runStartedAt: fresh ? now : (state?.runStartedAt ?? now),
    cursor,
    cursorUpdatedAt: now,
    error: null,
  });

  const deadline = Date.now() + TIME_BOX_MS;
  let { offset, upserted } = { offset: cursor.offset, upserted: cursor.upserted ?? 0 };

  try {
    for (;;) {
      if (Date.now() >= deadline) {
        await writeState(mediaType, { cursor: { offset, upserted }, cursorUpdatedAt: new Date() });
        return { done: false, status: "running", upserted, nextOffset: offset };
      }

      const page = await kitsuPage(mediaType, offset, PAGE_SIZE);
      await mediaDal.upsertMedia(page.data.map((item) => toMediaRow(item, page.included)));

      offset += PAGE_SIZE;
      upserted += page.data.length;

      const total = page.meta?.count;
      if (page.data.length === 0 || (typeof total === "number" && offset >= total)) {
        await writeState(mediaType, {
          status: "idle",
          cursor: null,
          cursorUpdatedAt: new Date(),
          lastCompletedAt: new Date(),
          error: null,
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
