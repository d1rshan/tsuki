import { neon } from "@neondatabase/serverless";
import { env } from "@tsuki/env/db";

const sql = neon(env.DATABASE_URL);

const statements = [
  // New owned-catalogue columns. `||` not concat_ws(): concat_ws is only
  // STABLE, generated columns require IMMUTABLE expressions.
  `ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "slug" text`,
  `ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "nsfw" boolean NOT NULL DEFAULT false`,
  `ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "title_search" text GENERATED ALWAYS AS ((coalesce(title_english, '') || ' ' || coalesce(title_romaji, '') || ' ' || coalesce(title_native, ''))) STORED`,
  // Crawl cursor state (ADR 0004 §3).
  `CREATE TABLE IF NOT EXISTS "sync_state" (
      "id" text PRIMARY KEY,
      "status" text NOT NULL DEFAULT 'idle',
      "cursor" jsonb,
      "cursor_updated_at" timestamp with time zone,
      "run_started_at" timestamp with time zone,
      "last_completed_at" timestamp with time zone,
      "error" text
   )`,
];

for (const statement of statements) {
  await sql.query(statement);
}
console.log(`Applied ${statements.length} migration statements.`);
