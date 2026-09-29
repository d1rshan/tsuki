import {
  KITSU_FORMAT_MAP,
  KITSU_STATUS_MAP,
  type FuzzyDate,
  type KitsuAnimeAttributes,
  type KitsuCategory,
  type KitsuImage,
  type KitsuIncluded,
  type KitsuMangaAttributes,
  type KitsuMedia,
  type KitsuMediaType,
  type KitsuStreamingLink,
} from "../types";

/** Anime and manga attributes viewed as one — fields of the other kind read
 * as undefined at runtime and are guarded by the kind checks below. */
type KitsuMergedAttributes = KitsuAnimeAttributes & KitsuMangaAttributes;

/** Looks a value up case-insensitively — Kitsu capitalizes some subtypes ("TV"). */
function lookup<T extends string>(table: Record<string, T>, value: string | null | undefined) {
  if (!value) return null;
  return table[value.toLowerCase()] ?? null;
}

/** ISO date string ("1998-04-03") → the FuzzyDate shape the media table stores. */
function toDate(iso: string | null | undefined): FuzzyDate | null {
  if (!iso) return null;

  const [year, month, day] = iso.slice(0, 10).split("-").map(Number);
  if (!year || !month || !day) return null;

  return { year, month, day };
}

/** Empty collapses to null too, so "none" has one form rather than two. */
function dropEmpty<T>(list: T[]) {
  return list.length > 0 ? list : null;
}

/** First parseable ISO string → Date; ISO 8601 per contract. */
function parseSecs(isos: (string | null | undefined)[]): Date {
  for (const iso of isos) {
    if (iso) {
      const date = new Date(iso);
      if (!Number.isNaN(date.getTime())) return date;
    }
  }
  return new Date(0);
}

type IncludedIndex = Map<string, KitsuIncluded>;

/** Indexes a response's `included` by "<type>:<id>" for relationship resolution. */
function indexIncluded(included: KitsuIncluded[] | undefined): IncludedIndex {
  const index: IncludedIndex = new Map();

  for (const resource of included ?? []) index.set(`${resource.type}:${resource.id}`, resource);

  return index;
}

/**
 * Resolves a media's own relationship ids against the response's `included`
 * index — list pages carry every item's includes, so unscoped lookup would
 * mix categories/links across all 20 rows.
 */
function resolveOwn<K extends KitsuIncluded["type"]>(
  media: KitsuMedia,
  kind: K,
  index: IncludedIndex,
): Extract<KitsuIncluded, { type: K }>[] {
  const identifiers = media.relationships?.[kind]?.data;
  if (!identifiers || !Array.isArray(identifiers)) return [];

  const own: Extract<KitsuIncluded, { type: K }>[] = [];
  for (const { id, type } of identifiers) {
    const resource = index.get(`${type}:${id}`);
    if (resource?.type === kind) own.push(resource as Extract<KitsuIncluded, { type: K }>);
  }
  return own;
}

/** Categories → genres: deduped case-insensitively, NSFW dropped, capped at 20. */
function toGenres(categories: KitsuCategory[]) {
  const seen = new Set<string>();
  const genres: string[] = [];

  for (const { attributes } of categories) {
    const title = attributes.title;
    if (!title || attributes.nsfw) continue;

    const key = title.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);

    if (genres.length === 20) break;
    genres.push(title);
  }

  return dropEmpty(genres);
}

function toTrailer(youtubeVideoId: string | null) {
  // Kitsu provides no thumbnail URL; the field stays nullable for AniList-era rows.
  return youtubeVideoId ? { id: youtubeVideoId, site: "youtube", thumbnail: null } : null;
}

/**
 * Streaming links → external links. The streamer name resolves only when a
 * streamers resource was fetched alongside; otherwise the row degrades to the
 * generic "streaming" label.
 */
function toExternalLinks(links: KitsuStreamingLink[], included: IncludedIndex) {
  const seen = new Set<string>();
  const externalLinks: { site: string; url: string }[] = [];

  for (const link of links) {
    const url = link.attributes.url;
    if (!url || seen.has(url)) continue;
    seen.add(url);

    const relationship = link.relationships?.streamer?.data;
    const identifier = relationship && !Array.isArray(relationship) ? relationship : null;
    const streamer = identifier ? included.get(`${identifier.type}:${identifier.id}`) : undefined;

    const site =
      streamer?.type === "streamers"
        ? (streamer.attributes.siteName ?? streamer.attributes.name ?? "streaming")
        : "streaming";

    externalLinks.push({ site, url });
  }

  return dropEmpty(externalLinks);
}

function pickImage(image: KitsuImage | null, ...keys: (keyof KitsuImage)[]) {
  for (const key of keys) {
    const url = image?.[key];
    if (url) return url;
  }
  return null;
}

/**
 * Maps a full Kitsu anime/manga document onto a `media` row. Kitsu provides
 * every field the row needs — the ones it can't (`source`, `season`,
 * `countryOfOrigin`) were dropped from the schema rather than faked.
 */
export function toMediaRow(media: KitsuMedia, included?: KitsuIncluded[]) {
  const attrs = media.attributes as KitsuMergedAttributes;
  const index = indexIncluded(included);
  const isAnime = media.type === "anime";

  const format =
    media.type === "anime"
      ? lookup(KITSU_FORMAT_MAP, media.attributes.subtype)
      : lookup(KITSU_FORMAT_MAP, media.attributes.mangaType ?? media.attributes.subtype);

  return {
    id: Number(media.id),
    type: rowType(media.type),
    titleRomaji: attrs.titles.en_jp ?? attrs.canonicalTitle,
    titleEnglish: attrs.titles.en ?? null,
    titleNative: attrs.titles.ja_jp ?? null,
    description: attrs.description ?? attrs.synopsis ?? null,
    coverImageExtraLarge: pickImage(attrs.posterImage, "large", "original"),
    coverImageLarge: attrs.posterImage?.medium ?? null,
    coverImageColor: null, // Kitsu has no dominant-color field.
    bannerImage: pickImage(attrs.coverImage, "large", "original"),
    format,
    status: lookup(KITSU_STATUS_MAP, attrs.status),
    episodes: isAnime ? attrs.episodeCount : null,
    duration: isAnime ? attrs.episodeLength : null,
    chapters: isAnime ? null : attrs.chapterCount,
    volumes: isAnime ? null : attrs.volumeCount,
    startDate: toDate(attrs.startDate),
    endDate: toDate(attrs.endDate),
    seasonYear: toDate(attrs.startDate)?.year ?? null,
    averageScore: attrs.averageRating ? Math.round(Number(attrs.averageRating)) : null,
    popularity: attrs.userCount,
    favourites: attrs.favoritesCount,
    genres: toGenres(resolveOwn(media, "categories", index)),
    trailer: toTrailer(isAnime ? attrs.youtubeVideoId : null),
    externalLinks: toExternalLinks(resolveOwn(media, "streamingLinks", index), index),
    slug: attrs.slug,
    nsfw: attrs.nsfw ?? false,
    // Kitsu's own updatedAt — media.updated_at carries it so the sync
    // watermark (max(updated_at)) compares Kitsu time against Kitsu time.
    // updatedAt → createdAt → epoch: the fallback must never be local time,
    // or one such row inflates max(updated_at) past every Kitsu timestamp
    // and freezes the incremental walk on page 1.
    updatedAt: parseSecs([
      attrs.updatedAt,
      attrs.createdAt,
      // A "no upstream time" marker older than any Kitsu timestamp.
      "1970-01-01T00:00:00.000Z",
    ]),
  };
}

export type MediaRow = ReturnType<typeof toMediaRow>;

function rowType(type: KitsuMediaType) {
  return type === "anime" ? ("ANIME" as const) : ("MANGA" as const);
}

/** The trimmed row used by search results and grids. */
export type MediaCompactRow = ReturnType<typeof toMediaCompactRow>;

export function toMediaCompactRow(media: KitsuMedia) {
  const attrs = media.attributes as KitsuMergedAttributes;
  const isAnime = media.type === "anime";

  return {
    id: Number(media.id),
    type: rowType(media.type),
    titleRomaji: attrs.titles.en_jp ?? attrs.canonicalTitle,
    titleEnglish: attrs.titles.en ?? null,
    titleNative: attrs.titles.ja_jp ?? null,
    coverImageExtraLarge: pickImage(attrs.posterImage, "large", "original"),
    coverImageLarge: attrs.posterImage?.medium ?? null,
    coverImageColor: null,
    bannerImage: pickImage(attrs.coverImage, "large", "original"),
    format:
      media.type === "anime"
        ? lookup(KITSU_FORMAT_MAP, media.attributes.subtype)
        : lookup(KITSU_FORMAT_MAP, media.attributes.mangaType ?? media.attributes.subtype),
    episodes: isAnime ? attrs.episodeCount : null,
    chapters: isAnime ? null : attrs.chapterCount,
    seasonYear: toDate(attrs.startDate)?.year ?? null,
    averageScore: attrs.averageRating ? Math.round(Number(attrs.averageRating)) : null,
  };
}
