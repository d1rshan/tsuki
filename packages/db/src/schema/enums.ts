import {
  LIST_STATUSES,
  MEDIA_FORMATS,
  MEDIA_SEASONS,
  MEDIA_SOURCES,
  MEDIA_STATUSES,
  MEDIA_TYPES,
} from "@tsuki/anilist";
import { pgEnum } from "drizzle-orm/pg-core";

// Enums derive from AniList's vocabulary in @tsuki/anilist so fetched values
// store without translation. Changing a value there requires a migration here.

export const mediaTypeEnum = pgEnum("media_type", MEDIA_TYPES);

export type MediaType = (typeof mediaTypeEnum.enumValues)[number];

export const mediaFormatEnum = pgEnum("media_format", MEDIA_FORMATS);

export const mediaStatusEnum = pgEnum("media_status", MEDIA_STATUSES);

export const mediaSeasonEnum = pgEnum("media_season", MEDIA_SEASONS);

export const mediaSourceEnum = pgEnum("media_source", MEDIA_SOURCES);

/** AniList's MediaListStatus — see @tsuki/anilist for the display note. */
export const listStatusEnum = pgEnum("list_status", LIST_STATUSES);

export const activityTypeEnum = pgEnum("activity_type", ["LOG", "REVIEW"]);
