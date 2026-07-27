import { relations, sql } from "drizzle-orm";
import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  primaryKey,
  index,
  check,
} from "drizzle-orm/pg-core";

import { user } from "./auth";
import { anime } from "./anime";
import { manga } from "./manga";
import { readStatusEnum, watchStatusEnum } from "./enums";

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

export const userMangaLibrary = pgTable(
  "user_manga_library",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    mangaId: integer("manga_id")
      .notNull()
      .references(() => manga.id, { onDelete: "cascade" }),
    status: readStatusEnum("status"),
    rating: integer("rating"),
    chaptersRead: integer("chapters_read").default(0).notNull(),
    isFavorite: boolean("is_favorite").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.mangaId] }),
    index("user_manga_library_mangaId_idx").on(table.mangaId),
    check("rating_range", sql`${table.rating} BETWEEN 1 AND 10`),
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

export const userMangaLibraryRelations = relations(userMangaLibrary, ({ one }) => ({
  user: one(user, {
    fields: [userMangaLibrary.userId],
    references: [user.id],
  }),
  manga: one(manga, {
    fields: [userMangaLibrary.mangaId],
    references: [manga.id],
  }),
}));
