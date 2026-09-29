import {
  pgTable,
  text,
  timestamp,
  integer,
  boolean,
  jsonb,
  index,
  primaryKey,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

import type { FuzzyDate, MediaExternalLink, MediaTrailer } from "../types";
import { mediaFormatEnum, mediaStatusEnum, mediaTypeEnum } from "../enums";

export const media = pgTable(
  "media",
  {
    // Kitsu ids are per-type — anime 1 and manga 1 are different titles — so
    // the key is (id, type), which is also what user-table FKs reference.
    id: integer("id").notNull(),
    type: mediaTypeEnum("type").notNull(),
    titleRomaji: text("title_romaji"),
    titleEnglish: text("title_english"),
    titleNative: text("title_native"),
    /**
     * Lowercased-ish haystack for pg_trgm search: all three titles concatenated.
     * `||` not concat_ws() — concat_ws is only STABLE, generated columns require
     * IMMUTABLE expressions.
     */
    titleSearch: text("title_search")
      .generatedAlwaysAs(
        sql`(coalesce(title_english, '') || ' ' || coalesce(title_romaji, '') || ' ' || coalesce(title_native, ''))`,
      )
      .$type<string>(),
    description: text("description"),
    coverImageExtraLarge: text("cover_image_extra_large"),
    coverImageLarge: text("cover_image_large"),
    coverImageColor: text("cover_image_color"),
    bannerImage: text("banner_image"),
    /** URL path segment on kitsu.app, e.g. "cowboy-bebop". */
    slug: text("slug"),
    nsfw: boolean("nsfw").notNull().default(false),
    format: mediaFormatEnum("format"),
    status: mediaStatusEnum("status"),
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
    /** Derived from startDate (Kitsu provides no season field). */
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
    primaryKey({ columns: [table.id, table.type] }),
    index("media_type_popularity_idx").on(table.type, table.popularity),
    // Requires the pg_trgm extension; created alongside push by src/search-index.ts.
    index("media_title_search_trgm_idx").using("gin", sql`${table.titleSearch} gin_trgm_ops`),
  ],
);
