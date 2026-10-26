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

/** Only qualifying progress and status changes belong in Activity. Reviews use {}. */
export type ActivitySnapshot = {
  status?: (typeof listStatusEnum.enumValues)[number] | null;
  statusFrom?: (typeof listStatusEnum.enumValues)[number] | null;
  /** A real same-day transition occurred, even if status returns to statusFrom. */
  statusChanged?: boolean;
  progress?: number;
  /** null explicitly records an increase without a pre-existing entry baseline. */
  progressFrom?: number | null;
};

/* LOG: one qualifying card per media per UTC day, latest qualifying timestamp.
 * REVIEW: one summary per media, preserving the review's original creation time.
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
