/**
 * Mirrors of Kitsu's JSON:API resource shapes (https://kitsu.app/api/edge),
 * kept to the fields we actually consume.
 */

/**
 * Canonical vocabularies — the database pgEnums
 * and downstream validators derive from this vocabulary, so Kitsu values are
 * translated into it in ./vocab rather than stored raw.
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
export type MediaFormat = (typeof MEDIA_FORMATS)[number];

export const MEDIA_STATUSES = [
  "FINISHED",
  "RELEASING",
  "NOT_YET_RELEASED",
  "CANCELLED",
  "HIATUS",
] as const;
export type MediaStatus = (typeof MEDIA_STATUSES)[number];

/**
 * AniList's `MediaListStatus`, copied verbatim — user-domain vocabulary that
 * has nothing to do with the provider.
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

/** Matches the shape stored in the media table's jsonb date columns. */
export type FuzzyDate = {
  year: number | null;
  month: number | null;
  day: number | null;
};

type MediaFormatValue = MediaFormat;
type MediaStatusValue = MediaStatus;

/** Kitsu's `subtype`/`mangaType` → our media_format vocabulary. */
export const KITSU_FORMAT_MAP: Record<string, MediaFormatValue> = {
  tv: "TV",
  movie: "MOVIE",
  ova: "OVA",
  ona: "ONA",
  special: "SPECIAL",
  music: "MUSIC",
  manga: "MANGA",
  doujin: "MANGA",
  manhua: "MANGA",
  manhwa: "MANGA",
  oel: "MANGA",
  lightnovel: "NOVEL",
  novel: "NOVEL",
  oneshot: "ONE_SHOT",
};

/** Kitsu's `status` → our media_status vocabulary. */
export const KITSU_STATUS_MAP: Record<string, MediaStatusValue> = {
  current: "RELEASING",
  finished: "FINISHED",
  upcoming: "NOT_YET_RELEASED",
  tba: "NOT_YET_RELEASED",
  unreleased: "NOT_YET_RELEASED",
};

export type KitsuMediaType = "anime" | "manga";

/** Kitsu image objects carry width/height under meta; only the URLs matter. */
export type KitsuImage = {
  tiny?: string | null;
  small?: string | null;
  medium?: string | null;
  large?: string | null;
  original?: string | null;
};

export type KitsuTitles = {
  en?: string | null;
  en_jp?: string | null;
  en_us?: string | null;
  ja_jp?: string | null;
};

/** Attributes common to every /anime and /manga document. */
export type KitsuMediaAttributes = {
  createdAt: string | null;
  updatedAt: string | null;
  slug: string | null;
  synopsis: string | null;
  /** Long prose — a superset of synopsis, preferred when present. */
  description: string | null;
  titles: KitsuTitles;
  canonicalTitle: string | null;
  abbreviatedTitles: string[] | null;
  /** 0–100 scale string, e.g. "82.27". */
  averageRating: string | null;
  ratingFrequencies: Record<string, string> | null;
  userCount: number | null;
  favoritesCount: number | null;
  /** ISO date strings, e.g. "1998-04-03". */
  startDate: string | null;
  endDate: string | null;
  nextRelease: string | null;
  popularityRank: number | null;
  ratingRank: number | null;
  ageRating: string | null;
  ageRatingGuide: string | null;
  /** Lowercase for manga ("manga"), often capitalized for anime ("TV"). */
  subtype: string | null;
  status: string | null;
  tba: string | null;
  /** Banner-ish image set. */
  coverImage: KitsuImage | null;
  /** Poster image set. */
  posterImage: KitsuImage | null;
  nsfw: boolean | null;
};

/** Anime-only attributes. */
export type KitsuAnimeAttributes = KitsuMediaAttributes & {
  episodeCount: number | null;
  /** Minutes per episode. */
  episodeLength: number | null;
  totalLength: number | null;
  youtubeVideoId: string | null;
  showType: string | null;
};

/** Manga-only attributes. */
export type KitsuMangaAttributes = KitsuMediaAttributes & {
  chapterCount: number | null;
  volumeCount: number | null;
  serialization: string | null;
  mangaType: string | null;
};

/** A JSON:API relationship object — identifiers or a lone resource link. */
export type KitsuRelationship = {
  data?: { id: string; type: string } | { id: string; type: string }[] | null;
};

export type KitsuResource<A> = {
  id: string;
  type: string;
  attributes: A;
  relationships?: Record<string, KitsuRelationship>;
};

/** A full anime or manga document, discriminated by `type`. */
export type KitsuMedia =
  | (KitsuResource<KitsuAnimeAttributes> & { type: "anime" })
  | (KitsuResource<KitsuMangaAttributes> & { type: "manga" });

/** Categories (our genres) come in via `include=categories`. The NSFW flag
 * is `nsfw` in the live payload (verified against kitsu.app/api/edge). */
export type KitsuCategory = KitsuResource<{
  title: string;
  slug?: string;
  nsfw?: boolean | null;
  description?: string | null;
  totalMediaCount?: number | null;
}> & { type: "categories" };

/** Streaming links come in via `include=streamingLinks`. */
export type KitsuStreamingLink = KitsuResource<{
  url: string;
  subs: string[];
  dubs: string[];
}> & { type: "streamingLinks" };

/** Streamers only arrive via a further lookup; resolved when included. */
export type KitsuStreamer = KitsuResource<{
  siteName?: string;
  name?: string;
}> & { type: "streamers" };

/** Any resource the mappers can resolve out of a response's `included`. */
export type KitsuIncluded = KitsuCategory | KitsuStreamingLink | KitsuStreamer;

export type KitsuLinks = {
  first?: string | null;
  next?: string | null;
  last?: string | null;
};

/** One raw page of a collection GET. */
export type KitsuPage<T, I = never> = {
  data: T[];
  /** Populated when the request carried an `include`. */
  included?: I[];
  links?: KitsuLinks;
  meta?: { count?: number };
};

/** One single-resource GET, with anything the `include` param pulled in. */
export type KitsuDocument<T, I = never> = {
  data: T;
  included?: I[];
};
