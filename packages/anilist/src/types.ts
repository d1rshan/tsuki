/**
 * Mirrors of AniList's GraphQL schema types — anime and manga are one `Media`
 * entity discriminated by `type`, sharing a global id space.
 * Reference: docs/docs/reference/object/media.md
 */

/**
 * Canonical restatements of AniList's GraphQL enum vocabularies. Everything
 * downstream — database pgEnums, API validators, client types — derives from
 * these arrays, so adding a value happens here and nowhere else.
 */

export const MEDIA_TYPES = ["ANIME", "MANGA"] as const;
export type MediaType = (typeof MEDIA_TYPES)[number];

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
type MediaFormat = (typeof MEDIA_FORMATS)[number];

export const MEDIA_STATUSES = [
  "FINISHED",
  "RELEASING",
  "NOT_YET_RELEASED",
  "CANCELLED",
  "HIATUS",
] as const;
type MediaStatus = (typeof MEDIA_STATUSES)[number];

export const MEDIA_SEASONS = ["WINTER", "SPRING", "SUMMER", "FALL"] as const;
type MediaSeason = (typeof MEDIA_SEASONS)[number];

export const MEDIA_SOURCES = [
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
] as const;
type MediaSource = (typeof MEDIA_SOURCES)[number];

/**
 * AniList's `MediaListStatus`. Deliberately type-agnostic — CURRENT reads as
 * "Watching" for anime and "Reading" for manga, which is a display concern.
 */
export const LIST_STATUSES = [
  "CURRENT",
  "PLANNING",
  "COMPLETED",
  "DROPPED",
  "PAUSED",
  "REPEATING",
] as const;
export type ListStatus = (typeof LIST_STATUSES)[number];

/** AniList dates are fuzzy — any component may be unknown. */
export type FuzzyDate = {
  year: number | null;
  month: number | null;
  day: number | null;
};

type MediaTitle = {
  romaji: string | null;
  english: string | null;
  native: string | null;
};

type MediaCoverImage = {
  extraLarge: string | null;
  large: string | null;
  color: string | null;
};

type MediaTrailer = {
  id: string;
  site: string;
  thumbnail: string;
};

type MediaExternalLink = {
  url: string;
  site: string;
  type: string;
  language: string | null;
  color: string | null;
  icon: string | null;
};

/** The full `Media` selection — see MEDIA_FIELDS in ./queries/fragments. */
export type AnilistMedia = {
  id: number;
  type: MediaType;
  title: MediaTitle;
  description: string | null;
  coverImage: MediaCoverImage;
  bannerImage: string | null;
  format: MediaFormat | null;
  status: MediaStatus | null;
  source: MediaSource | null;
  countryOfOrigin: string | null;
  /** Anime only. */
  episodes: number | null;
  /** Anime only — minutes per episode. */
  duration: number | null;
  /** Manga only. */
  chapters: number | null;
  /** Manga only. */
  volumes: number | null;
  startDate: FuzzyDate | null;
  endDate: FuzzyDate | null;
  season: MediaSeason | null;
  seasonYear: number | null;
  averageScore: number | null;
  popularity: number | null;
  favourites: number | null;
  genres: (string | null)[] | null;
  trailer: MediaTrailer | null;
  externalLinks: (MediaExternalLink | null)[] | null;
};

/** The trimmed selection — mirrors MEDIA_COMPACT_FIELDS in ./queries/fragments. */
export type AnilistMediaCompact = Pick<
  AnilistMedia,
  | "id"
  | "type"
  | "title"
  | "bannerImage"
  | "format"
  | "episodes"
  | "chapters"
  | "seasonYear"
  | "averageScore"
> & { coverImage: Pick<MediaCoverImage, "extraLarge" | "large" | "color"> };
