import { relations } from "drizzle-orm";
import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { user } from "./auth";
import { anime } from "./anime";
import { manga } from "./manga";

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

export const userMangaReviews = pgTable(
  "user_manga_reviews",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    mangaId: integer("manga_id")
      .notNull()
      .references(() => manga.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    containsSpoilers: boolean("contains_spoilers").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("user_manga_reviews_unique_idx").on(table.userId, table.mangaId),
    index("user_manga_reviews_mangaId_idx").on(table.mangaId),
  ],
);

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

export const userMangaReviewsRelations = relations(userMangaReviews, ({ one }) => ({
  user: one(user, {
    fields: [userMangaReviews.userId],
    references: [user.id],
  }),
  manga: one(manga, {
    fields: [userMangaReviews.mangaId],
    references: [manga.id],
  }),
}));
