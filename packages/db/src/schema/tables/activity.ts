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
import { activityTypeEnum } from "../enums";

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

export type ActivitySnapshot = {
  status?: (typeof listStatusEnum.enumValues)[number] | null;
  score?: number | null;
  progress?: number;
  progressVolumes?: number | null;
  repeat?: number;
  /** Rich Content document (review preset) for REVIEW cards. */
  content?: RichContent;
};

/*
Activity is a single event store with two kinds:
- LOG: one card per media per UTC day; the sourceId is "<mediaId>:<yyyy-mm-dd>".
  A same-day re-log upserts (snapshot replaced, occurredAt bumped); a new UTC
  day yields a new row.
- REVIEW: one card per media; re-submission replaces the snapshot while the
  original occurredAt is preserved (upsert never touches the timestamp).
*/

export const activity = pgTable(
  "activity",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    actorId: text("actor_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    type: activityTypeEnum("type").notNull(),
    /** Stable source identity lets edits replace the original card. */
    sourceId: text("source_id").notNull(),
    mediaId: integer("media_id"),
    mediaType: mediaTypeEnum("media_type"),
    snapshot: jsonb("snapshot").$type<ActivitySnapshot>().notNull(),
    occurredAt: timestamp("occurred_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("activity_actor_source_unique_idx").on(table.actorId, table.type, table.sourceId),
    index("activity_occurred_idx").on(table.occurredAt.desc(), table.id.desc()),
    index("activity_actor_occurred_idx").on(
      table.actorId,
      table.occurredAt.desc(),
      table.id.desc(),
    ),
  ],
);
