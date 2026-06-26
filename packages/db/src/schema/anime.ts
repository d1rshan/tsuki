import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, boolean, integer, jsonb, pgEnum } from "drizzle-orm/pg-core";

import { userAnimeLibrary, userReviews } from "./activity";

export const mediaStatusEnum = pgEnum("media_status", [
  "FINISHED",
  "RELEASING",
  "NOT_YET_RELEASED",
  "CANCELLED",
  "HIATUS",
]);

export const anime = pgTable("anime", {
  id: integer("id").primaryKey(), // AniList ID
  titleRomaji: text("title_romaji"),
  titleEnglish: text("title_english"),
  titleNative: text("title_native"),
  description: text("description"),
  coverImageExtraLarge: text("cover_image_extra_large"),
  coverImageLarge: text("cover_image_large"),
  coverImageColor: text("cover_image_color"),
  bannerImage: text("banner_image"),
  format: text("format"),
  status: mediaStatusEnum("status"),
  episodes: integer("episodes"),
  duration: integer("duration"),
  season: text("season"),
  seasonYear: integer("season_year"),
  averageScore: integer("average_score"),
  meanScore: integer("mean_score"),
  popularity: integer("popularity"),
  trending: integer("trending"),
  genres: jsonb("genres").$type<string[]>(),
  trailer: jsonb("trailer").$type<{ id: string; site: string; thumbnail: string }>(),
  externalLinks:
    jsonb("external_links").$type<
      { url: string; site: string; type: string; color: string | null; icon: string | null }[]
    >(),
  isAdult: boolean("is_adult").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const animeRelations = relations(anime, ({ many }) => ({
  libraryEntries: many(userAnimeLibrary),
  reviews: many(userReviews),
}));
