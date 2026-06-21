import { relations, sql } from "drizzle-orm";
import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  primaryKey,
  index,
  uniqueIndex,
  pgEnum,
  check,
} from "drizzle-orm/pg-core";

import { user } from "./auth";
import { anime } from "./anime";

export const watchStatusEnum = pgEnum("watch_status", [
  "WATCHING",
  "COMPLETED",
  "PLAN_TO_WATCH",
  "DROPPED",
  "PAUSED",
]);

export const userAnimeLibrary = pgTable(
  "user_anime_library",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    animeId: integer("anime_id")
      .notNull()
      .references(() => anime.id, { onDelete: "cascade" }),
    status: watchStatusEnum("status"),
    rating: integer("rating"),
    episodesWatched: integer("episodes_watched").default(0).notNull(),
    isFavorite: boolean("is_favorite").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.animeId] }),
    index("user_anime_library_animeId_idx").on(table.animeId),
    check("rating_range", sql`${table.rating} BETWEEN 1 AND 10`),
  ],
);

export const userReviews = pgTable(
  "user_reviews",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    animeId: integer("anime_id")
      .notNull()
      .references(() => anime.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    containsSpoilers: boolean("contains_spoilers").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("user_reviews_unique_idx").on(table.userId, table.animeId),
    index("user_reviews_animeId_idx").on(table.animeId),
  ],
);

export const userAnimeLibraryRelations = relations(userAnimeLibrary, ({ one }) => ({
  user: one(user, {
    fields: [userAnimeLibrary.userId],
    references: [user.id],
  }),
  anime: one(anime, {
    fields: [userAnimeLibrary.animeId],
    references: [anime.id],
  }),
}));

export const userReviewsRelations = relations(userReviews, ({ one }) => ({
  user: one(user, {
    fields: [userReviews.userId],
    references: [user.id],
  }),
  anime: one(anime, {
    fields: [userReviews.animeId],
    references: [anime.id],
  }),
}));
