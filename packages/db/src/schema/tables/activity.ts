import { sql } from "drizzle-orm";
import { check, index, integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { mediaTypeEnum } from "../enums";
import { user } from "./auth";

/** Positive episode/chapter increments recorded from the day this table is deployed. */
export const progressActivity = pgTable(
  "progress_activity",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    mediaType: mediaTypeEnum("media_type").notNull(),
    amount: integer("amount").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("progress_activity_user_created_idx").on(table.userId, table.createdAt.desc()),
    check("progress_activity_amount_positive", sql`${table.amount} > 0`),
  ],
);
