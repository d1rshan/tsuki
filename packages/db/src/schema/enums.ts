import { pgEnum } from "drizzle-orm/pg-core";

// Enums mirror AniList's GraphQL schema so fetched values store without
// translation. See docs/docs/reference/enum/.

export const mediaTypeEnum = pgEnum("media_type", ["ANIME", "MANGA"]);

export type MediaType = (typeof mediaTypeEnum.enumValues)[number];

export const mediaFormatEnum = pgEnum("media_format", [
  "TV",
  "TV_SHORT",
  "MOVIE",
  "SPECIAL",
  "OVA",
  "ONA",
  "MUSIC",
  "MANGA",
  "NOVEL",
  "ONE_SHOT",
]);

export const mediaStatusEnum = pgEnum("media_status", [
  "FINISHED",
  "RELEASING",
  "NOT_YET_RELEASED",
  "CANCELLED",
  "HIATUS",
]);

export const mediaSeasonEnum = pgEnum("media_season", ["WINTER", "SPRING", "SUMMER", "FALL"]);

export const mediaSourceEnum = pgEnum("media_source", [
  "ORIGINAL",
  "MANGA",
  "LIGHT_NOVEL",
  "VISUAL_NOVEL",
  "VIDEO_GAME",
  "OTHER",
  "NOVEL",
  "DOUJINSHI",
  "ANIME",
  "WEB_NOVEL",
  "LIVE_ACTION",
  "GAME",
  "COMIC",
  "MULTIMEDIA_PROJECT",
  "PICTURE_BOOK",
]);

/**
 * AniList `MediaListStatus`. Deliberately type-agnostic — CURRENT reads as
 * "Watching" for anime and "Reading" for manga, which is a display concern.
 */
export const listStatusEnum = pgEnum("list_status", [
  "CURRENT",
  "PLANNING",
  "COMPLETED",
  "DROPPED",
  "PAUSED",
  "REPEATING",
]);
