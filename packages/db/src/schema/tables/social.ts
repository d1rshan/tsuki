import { sql } from "drizzle-orm";
import { check, index, pgTable, primaryKey, text, timestamp } from "drizzle-orm/pg-core";

import { user } from "./auth";

export const social = pgTable(
  "social",
  {
    followerId: text("follower_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    followingId: text("following_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.followerId, table.followingId] }),
    index("social_follower_created_idx").on(
      table.followerId,
      table.createdAt.desc(),
      table.followingId.desc(),
    ),
    index("social_following_created_idx").on(
      table.followingId,
      table.createdAt.desc(),
      table.followerId.desc(),
    ),
    check("social_no_self_follow", sql`${table.followerId} <> ${table.followingId}`),
  ],
);
