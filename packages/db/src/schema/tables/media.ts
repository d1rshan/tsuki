import { pgTable, text, timestamp, integer, jsonb, index, uniqueIndex } from "drizzle-orm/pg-core";

import type { FuzzyDate, MediaExternalLink, MediaTrailer } from "../types";
import {
  mediaFormatEnum,
  mediaSeasonEnum,
  mediaSourceEnum,
  mediaStatusEnum,
  mediaTypeEnum,
} from "../enums";

export const media = pgTable(
  "media",
  {
    id: integer("id").primaryKey(), // AniList id
    type: mediaTypeEnum("type").notNull(),
    titleRomaji: text("title_romaji"),
    titleEnglish: text("title_english"),
    titleNative: text("title_native"),
    description: text("description"),
    coverImageExtraLarge: text("cover_image_extra_large"),
    coverImageLarge: text("cover_image_large"),
    coverImageColor: text("cover_image_color"),
    bannerImage: text("banner_image"),
    format: mediaFormatEnum("format"),
    status: mediaStatusEnum("status"),
    source: mediaSourceEnum("source"),
    countryOfOrigin: text("country_of_origin"),
    /** Anime only. */
    episodes: integer("episodes"),
    /** Anime only — minutes per episode. */
    duration: integer("duration"),
    /** Manga only. */
    chapters: integer("chapters"),
    /** Manga only. */
    volumes: integer("volumes"),
    startDate: jsonb("start_date").$type<FuzzyDate>(),
    endDate: jsonb("end_date").$type<FuzzyDate>(),
    season: mediaSeasonEnum("season"),
    seasonYear: integer("season_year"),
    averageScore: integer("average_score"),
    popularity: integer("popularity"),
    favourites: integer("favourites"),
    genres: jsonb("genres").$type<string[]>(),
    trailer: jsonb("trailer").$type<MediaTrailer>(),
    externalLinks: jsonb("external_links").$type<MediaExternalLink[]>(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    // Redundant for uniqueness (id is the PK) but required as the target of the
    // composite foreign keys on library and reviews. Declared as a unique
    // index, not a constraint: drizzle-kit push can't diff named unique
    // constraints and re-suggests them forever.
    // ponytail: if drizzle-kit ever fixes constraint diffing, switch back to unique().
    uniqueIndex("media_id_type_unique").on(table.id, table.type),
    index("media_type_popularity_idx").on(table.type, table.popularity),
  ],
);
