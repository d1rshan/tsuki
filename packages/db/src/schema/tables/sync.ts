import { jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";

/** Crawl position plus run counters, persisted between ticks. `watermark` is
 * the incremental walk's stop boundary (ISO instant): only the pass that
 * captured it promotes it on completion. */
export type SyncCursor = { offset: number; upserted?: number; watermark?: string };

/** One row per crawl target ("anime", "manga"). */
export const syncState = pgTable("sync_state", {
  id: text("id").primaryKey(),
  status: text("status").$type<SyncStatus>().notNull().default("idle"),
  cursor: jsonb("cursor").$type<SyncCursor>(),
  cursorUpdatedAt: timestamp("cursor_updated_at", { withTimezone: true }),
  runStartedAt: timestamp("run_started_at", { withTimezone: true }),
  lastCompletedAt: timestamp("last_completed_at", { withTimezone: true }),
  /** Incremental coverage ceiling (ISO instant): rows with a Kitsu updatedAt
   * newer than this are all the nightly walk has to upsert. */
  watermark: text("watermark"),
  error: text("error"),
});

export type SyncStatus = "idle" | "running" | "failed";
