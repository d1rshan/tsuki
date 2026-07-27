import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  jsonb,
  index,
  unique,
} from "drizzle-orm/pg-core";

import type { FuzzyDate, MediaExternalLink, MediaTag, MediaTrailer } from "../types";
import {
  mediaFormatEnum,
  mediaSeasonEnum,
  mediaSourceEnum,
  mediaStatusEnum,
  mediaTypeEnum,
} from "../enums";

/**
 * A local cache of AniList's `Media`. Anime and manga share one table because
 * AniList models them as one entity discriminated by `type`, over a single
 * globally unique id space (verified: id 1 resolves only as ANIME, 30002 only
 * as MANGA). Type-specific columns are simply null for the other type.
 */
export const media = pgTable(
  "media",
  {
    id: integer("id").primaryKey(), // AniList id
    idMal: integer("id_mal"),
    type: mediaTypeEnum("type").notNull(),
    titleRomaji: text("title_romaji"),
    titleEnglish: text("title_english"),
    titleNative: text("title_native"),
    synonyms: jsonb("synonyms").$type<string[]>(),
    description: text("description"),
    coverImageExtraLarge: text("cover_image_extra_large"),
    coverImageLarge: text("cover_image_large"),
    coverImageMedium: text("cover_image_medium"),
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
    meanScore: integer("mean_score"),
    popularity: integer("popularity"),
    trending: integer("trending"),
    favourites: integer("favourites"),
    genres: jsonb("genres").$type<string[]>(),
    tags: jsonb("tags").$type<MediaTag[]>(),
    trailer: jsonb("trailer").$type<MediaTrailer>(),
    externalLinks: jsonb("external_links").$type<MediaExternalLink[]>(),
    siteUrl: text("site_url"),
    isAdult: boolean("is_adult").default(false),
    /** When we last pulled this row from AniList, for TTL refresh. */
    syncedAt: timestamp("synced_at").defaultNow().notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    // Redundant for uniqueness (id is the PK) but required as the target of the
    // composite foreign keys on library_entries and reviews.
    unique("media_id_type_unique").on(table.id, table.type),
    index("media_type_popularity_idx").on(table.type, table.popularity),
  ],
);
