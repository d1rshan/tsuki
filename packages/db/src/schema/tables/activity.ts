import { sql } from "drizzle-orm";
import { check, date, integer, pgTable, primaryKey, text } from "drizzle-orm/pg-core";

import { mediaTypeEnum } from "../enums";
import { user } from "./auth";

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
