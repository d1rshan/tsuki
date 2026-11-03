import { sql } from "drizzle-orm";
import {
  check,
  date,
  index,
  integer,
  jsonb,
  pgTable,
  foreignKey,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { listStatusEnum, mediaTypeEnum } from "../enums";
import { library } from "./library";
import { user } from "./auth";
import { activityTypeEnum } from "../enums";

/** A consumed inclusive range; calendar date is independent of posting time. */
export const progress = pgTable(
  "progress_session",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    mediaId: integer("media_id").notNull(),
    mediaType: mediaTypeEnum("media_type").notNull(),
    start: integer("start_number").notNull(),
    end: integer("end_number").notNull(),
    activityDate: date("activity_date"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    check("session_valid_range", sql`${table.start} > 0 AND ${table.end} >= ${table.start}`),
    index("session_user_date_idx").on(table.userId, table.activityDate),
    foreignKey({
      columns: [table.userId, table.mediaId],
      foreignColumns: [library.userId, library.mediaId],
    }).onDelete("cascade"),
  ],
);

/** Only qualifying progress and status changes belong in Activity. */
export type ActivitySnapshot = {
  status?: (typeof listStatusEnum.enumValues)[number] | null;
  statusFrom?: (typeof listStatusEnum.enumValues)[number] | null;
  /** A real same-day transition occurred, even if status returns to statusFrom. */
  statusChanged?: boolean;
  progress?: number;
  /** null explicitly records an increase without a pre-existing entry baseline. */
  progressFrom?: number | null;
};

/** One qualifying Log per media per UTC day, latest qualifying timestamp. */
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
