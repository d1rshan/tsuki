/**
 * Mirrors of AniList's GraphQL schema types.
 *
 * AniList models anime and manga as a single `Media` entity discriminated by
 * `type`, with a shared, globally unique id space. We mirror that here so
 * fetched fields map straight onto our own `media` rows with no reshaping.
 *
 * Reference: docs/docs/reference/object/media.md
 */

export type MediaType = "ANIME" | "MANGA";

export type MediaFormat =
  | "TV"
  | "TV_SHORT"
  | "MOVIE"
  | "SPECIAL"
  | "OVA"
  | "ONA"
  | "MUSIC"
  | "MANGA"
  | "NOVEL"
  | "ONE_SHOT";

export type MediaStatus = "FINISHED" | "RELEASING" | "NOT_YET_RELEASED" | "CANCELLED" | "HIATUS";

export type MediaSeason = "WINTER" | "SPRING" | "SUMMER" | "FALL";

export type MediaSource =
  | "ORIGINAL"
  | "MANGA"
  | "LIGHT_NOVEL"
  | "VISUAL_NOVEL"
  | "VIDEO_GAME"
  | "OTHER"
  | "NOVEL"
  | "DOUJINSHI"
  | "ANIME"
  | "WEB_NOVEL"
  | "LIVE_ACTION"
  | "GAME"
  | "COMIC"
  | "MULTIMEDIA_PROJECT"
  | "PICTURE_BOOK";

/** AniList dates are fuzzy — any component may be unknown. */
export type FuzzyDate = {
  year: number | null;
  month: number | null;
  day: number | null;
};

export type MediaTitle = {
  romaji: string | null;
  english: string | null;
  native: string | null;
};

export type MediaCoverImage = {
  extraLarge: string | null;
  large: string | null;
  medium: string | null;
  color: string | null;
};

export type MediaTrailer = {
  id: string;
  site: string;
  thumbnail: string;
};

export type MediaExternalLink = {
  url: string;
  site: string;
  type: string;
  color: string | null;
  icon: string | null;
};

export type MediaTag = {
  id: number;
  name: string;
  category: string | null;
  rank: number | null;
  isGeneralSpoiler: boolean;
  isMediaSpoiler: boolean;
  isAdult: boolean;
};

/** The full `Media` selection — see MEDIA_FIELDS in ./queries/fragments. */
export type AnilistMedia = {
  id: number;
  idMal: number | null;
  type: MediaType;
  title: MediaTitle;
  synonyms: (string | null)[] | null;
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
  meanScore: number | null;
  popularity: number | null;
  favourites: number | null;
  genres: (string | null)[] | null;
  tags: (MediaTag | null)[] | null;
  trailer: MediaTrailer | null;
  externalLinks: (MediaExternalLink | null)[] | null;
  siteUrl: string | null;
  isAdult: boolean | null;
};

/** The trimmed selection used for search results and grids. */
export type AnilistMediaCompact = Pick<
  AnilistMedia,
  | "id"
  | "type"
  | "title"
  | "coverImage"
  | "bannerImage"
  | "format"
  | "episodes"
  | "chapters"
  | "seasonYear"
  | "averageScore"
>;
