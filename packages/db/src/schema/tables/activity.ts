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

import type { RichContent } from "@tsuki/rich-content";

import { listStatusEnum, mediaTypeEnum } from "../enums";
import { user } from "./auth";
import { feedActivityTypeEnum } from "../enums";

// progress table -> for heatmap, updated via db trigger
// tracks only watching, reading deltas

export const progress = pgTable(
  "progress",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    mediaType: mediaTypeEnum("media_type").notNull(),
    activityDate: date("activity_date")
      // ponytail: no explicit ::date cast here AND written PG-normalized —
      // drizzle-kit strips a trailing cast from the introspected default but
      // not from the schema side, so any other spelling churns a no-op
      // SET DEFAULT on every push.
      .default(sql`(now() AT TIME ZONE 'UTC'::text)`)
      .notNull(),
    amount: integer("amount").notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.mediaType, table.activityDate] }),
    check("progress_amount_positive", sql`${table.amount} > 0`),
  ],
);

export type FeedActivitySnapshot = {
  status?: (typeof listStatusEnum.enumValues)[number] | null;
  score?: number | null;
  progress?: number;
  progressVolumes?: number | null;
  repeat?: number;
  /** Rich Content document (review preset) for REVIEW cards. */
  content?: RichContent;
};

/*
feed table should track activity:
our feed table:

so we have one row for review -> which is fixed per media id, updating review currently keeps the original date which is fine.

and one row for other log stuff -> which is fixed per media id per day.
log update in same day updates timestamp to latest event.

consumers: social feed, user recent activity.
*/

export const feed = pgTable(
  "feed",
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
    uniqueIndex("feed_actor_source_unique_idx").on(table.actorId, table.type, table.sourceId),
    index("feed_occurred_idx").on(table.occurredAt.desc(), table.id.desc()),
    index("feed_actor_occurred_idx").on(table.actorId, table.occurredAt.desc(), table.id.desc()),
    index("feed_target_user_idx").on(table.targetUserId),
  ],
);
