import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, boolean, index, integer, jsonb } from "drizzle-orm/pg-core";

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
  status: text("status"),
  episodes: integer("episodes"),
  duration: integer("duration"),
  season: text("season"),
  seasonYear: integer("season_year"),
  averageScore: integer("average_score"),
  meanScore: integer("mean_score"),
  popularity: integer("popularity"),
  trending: integer("trending"),
  genres: jsonb("genres").$type<string[]>(),
  tags: jsonb("tags"), // e.g. [{ name: "Action", rank: 90 }]
  isAdult: boolean("is_adult").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const trendingAnime = pgTable(
  "trending_anime",
  {
    animeId: integer("anime_id")
      .primaryKey()
      .references(() => anime.id, { onDelete: "cascade" }),
    position: integer("position").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("trending_anime_position_idx").on(table.position)],
);

export const animeRelations = relations(anime, ({ many }) => ({
  trending: many(trendingAnime),
}));

export const trendingAnimeRelations = relations(trendingAnime, ({ one }) => ({
  anime: one(anime, {
    fields: [trendingAnime.animeId],
    references: [anime.id],
  }),
}));
