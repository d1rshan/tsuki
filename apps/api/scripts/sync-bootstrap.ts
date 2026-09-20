/**
 * Bootstraps the media catalogue by crawling Kitsu's anime and manga
 * collections end to end (see docs/adr/0004-own-media-catalogue.md).
 *
 * Usage (cwd: apps/api):
 *   bun run scripts/sync-bootstrap.ts            # fresh crawl (resets cursors)
 *   bun run scripts/sync-bootstrap.ts --resume   # continue from saved cursors
 *
 * Requires DATABASE_URL in .env; talks to Kitsu and Postgres directly, no API
 * process needed. Prints progress per tick (~40s of crawling each). Transient
 * Neon/Kitsu failures are retried; the cursor keeps the walk resumable.
 */
import { resetSync, runSyncTick } from "../src/modules/sync/service";

const resume = process.argv.includes("--resume");
const RETRIES = 5;

for (const mediaType of ["ANIME", "MANGA"] as const) {
  if (!resume) {
    console.log(`[sync] resetting ${mediaType} for a fresh crawl`);
    await resetSync(mediaType);
  }

  for (let tick = 1; ; tick++) {
    // Single local writer: force bypasses the already-running guard, so each
    // tick works its full time-box back to back. Transient infra failures
    // (Neon DATA_CLONE_ERR etc.) retry from the same cursor.
    let result;
    for (let attempt = 1; ; attempt++) {
      try {
        result = await runSyncTick(mediaType, { force: true });
        break;
      } catch (error) {
        if (attempt >= RETRIES) throw error;
        console.log(`[sync] ${mediaType} tick ${tick} attempt ${attempt} failed:`, error);
        await new Promise((resolve) => setTimeout(resolve, 15_000));
      }
    }

    console.log(
      `[sync] ${mediaType} tick ${tick}: status=${result.status} ` +
        `upserted=${result.upserted} nextOffset=${result.nextOffset ?? "—"}`,
    );
    if (result.done) {
      console.log(`[sync] ${mediaType} complete (${result.upserted} rows)`);
      break;
    }
  }
}
