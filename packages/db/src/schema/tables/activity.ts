import { sql } from "drizzle-orm";
import {
  check,
  date,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { mediaTypeEnum } from "../enums";
import { user } from "./auth";
import { feedActivityTypeEnum } from "../enums";

export const progressActivity = pgTable(
  "progress_activity",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    mediaType: mediaTypeEnum("media_type").notNull(),
    activityDate: date("activity_date")
      .default(sql`(now() at time zone 'UTC')::date`)
      .notNull(),
    amount: integer("amount").notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.mediaType, table.activityDate] }),
    check("progress_activity_amount_positive", sql`${table.amount} > 0`),
  ],
);

export type FeedActivitySnapshot = {
  status?: "CURRENT" | "PLANNING" | "COMPLETED" | "DROPPED" | "PAUSED" | "REPEATING" | null;
  score?: number | null;
  progress?: number;
  progressVolumes?: number | null;
  repeat?: number;
  content?: string;
  containsSpoilers?: boolean;
};

export const feedActivities = pgTable(
  "feed_activities",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    actorId: text("actor_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    type: feedActivityTypeEnum("type").notNull(),
    /** Stable source identity lets edits replace the original card. */
    sourceId: text("source_id").notNull(),
    mediaId: integer("media_id"),
    mediaType: mediaTypeEnum("media_type"),
    targetUserId: text("target_user_id").references(() => user.id, { onDelete: "cascade" }),
    snapshot: jsonb("snapshot").$type<FeedActivitySnapshot>().notNull(),
    occurredAt: timestamp("occurred_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("feed_activities_actor_source_unique_idx").on(
      table.actorId,
      table.type,
      table.sourceId,
    ),
    index("feed_activities_occurred_idx").on(table.occurredAt.desc(), table.id.desc()),
    index("feed_activities_actor_occurred_idx").on(
      table.actorId,
      table.occurredAt.desc(),
      table.id.desc(),
    ),
    index("feed_activities_target_user_idx").on(table.targetUserId),
  ],
);
