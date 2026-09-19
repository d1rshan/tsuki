/**
 * Bootstraps the media catalogue by crawling Kitsu's anime and manga
 * collections end to end (see docs/adr/0004-own-media-catalogue.md).
 *
 * IMPORTANT: run AFTER the AniList→Kitsu id migration (Phase 4) — until then
 * Kitsu ids would collide with rows still keyed by AniList ids.
 *
 * Usage: bun run apps/api/scripts/sync-bootstrap.ts   (cwd: apps/api)
 * Requires DATABASE_URL in .env; talks to Kitsu and Postgres directly, no API
 * process needed. Prints progress per tick (~40s of crawling each).
 */
import { resetSync, runSyncTick } from "../src/modules/sync/service";

for (const mediaType of ["ANIME", "MANGA"] as const) {
  console.log(`[sync] resetting ${mediaType} for a fresh crawl`);
  await resetSync(mediaType);

  for (let tick = 1; ; tick++) {
    // Single local writer: force bypasses the already-running guard, so each
    // tick works its full time-box back to back.
    const result = await runSyncTick(mediaType, { force: true });
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
