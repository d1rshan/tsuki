import { jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";

/** Crawl position plus run counters, persisted between ticks. */
export type SyncCursor = { offset: number; upserted?: number };

/** One row per crawl target ("anime", "manga"). */
export const syncState = pgTable("sync_state", {
  id: text("id").primaryKey(),
  status: text("status").$type<SyncStatus>().notNull().default("idle"),
  cursor: jsonb("cursor").$type<SyncCursor>(),
  cursorUpdatedAt: timestamp("cursor_updated_at", { withTimezone: true }),
  runStartedAt: timestamp("run_started_at", { withTimezone: true }),
  lastCompletedAt: timestamp("last_completed_at", { withTimezone: true }),
  error: text("error"),
});

export type SyncStatus = "idle" | "running" | "failed";
