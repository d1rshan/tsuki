import { pgEnum } from "drizzle-orm/pg-core";

/**
 * Canonical media vocabularies, restated locally so the database has no
 * dependency on any upstream provider package. Provider mappers translate
 * their raw values into this vocabulary before storing.
 */

export const MEDIA_TYPES = ["ANIME", "MANGA"] as const;

export const MEDIA_FORMATS = [
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
] as const;

export const MEDIA_STATUSES = [
  "FINISHED",
  "RELEASING",
  "NOT_YET_RELEASED",
  "CANCELLED",
  "HIATUS",
] as const;

/**
 * Type-agnostic user vocabulary — CURRENT reads as "Watching" for anime and
 * "Reading" for manga, which is a display concern.
 */
export const LIST_STATUSES = [
  "CURRENT",
  "PLANNING",
  "COMPLETED",
  "DROPPED",
  "PAUSED",
  "REPEATING",
] as const;

export const ACTIVITY_TYPE = ["LOG", "REVIEW"] as const;

export const mediaTypeEnum = pgEnum("media_type", MEDIA_TYPES);

export type MediaType = (typeof mediaTypeEnum.enumValues)[number];

export const mediaFormatEnum = pgEnum("media_format", MEDIA_FORMATS);

export const mediaStatusEnum = pgEnum("media_status", MEDIA_STATUSES);

export const listStatusEnum = pgEnum("list_status", LIST_STATUSES);

export const activityTypeEnum = pgEnum("activity_type", ACTIVITY_TYPE);
