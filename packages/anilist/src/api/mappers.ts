import type { AnilistMedia, AnilistMediaCompact, FuzzyDate } from "../types";

/** Empty collapses to null too, so "none" has one form rather than two. */
function dropNulls<T>(list: (T | null)[] | null | undefined): T[] | null {
  if (!list) return null;

  const items = list.filter((item): item is T => item != null);
  return items.length > 0 ? items : null;
}

/** AniList returns `{ year: null, month: null, day: null }` for unknown dates. */
function normalizeDate(date: FuzzyDate | null | undefined): FuzzyDate | null {
  if (!date) return null;
  if (date.year == null && date.month == null && date.day == null) return null;
  return date;
}

/** Maps a full AniList `Media` onto a `media` row. */
export function toMediaRow(media: AnilistMedia) {
  return {
    id: media.id,
    type: media.type,
    titleRomaji: media.title.romaji,
    titleEnglish: media.title.english,
    titleNative: media.title.native,
    description: media.description,
    coverImageExtraLarge: media.coverImage.extraLarge,
    coverImageLarge: media.coverImage.large,
    coverImageColor: media.coverImage.color,
    bannerImage: media.bannerImage,
    format: media.format,
    status: media.status,
    source: media.source,
    countryOfOrigin: media.countryOfOrigin,
    episodes: media.episodes,
    duration: media.duration,
    chapters: media.chapters,
    volumes: media.volumes,
    startDate: normalizeDate(media.startDate),
    endDate: normalizeDate(media.endDate),
    season: media.season,
    seasonYear: media.seasonYear,
    averageScore: media.averageScore,
    popularity: media.popularity,
    favourites: media.favourites,
    genres: dropNulls(media.genres),
    trailer: media.trailer,
    externalLinks: dropNulls(media.externalLinks),
  };
}

/** Maps the trimmed AniList selection used by search results and grids. */
export function toMediaCompactRow(media: AnilistMediaCompact) {
  return {
    id: media.id,
    type: media.type,
    titleRomaji: media.title.romaji,
    titleEnglish: media.title.english,
    titleNative: media.title.native,
    coverImageExtraLarge: media.coverImage.extraLarge,
    coverImageLarge: media.coverImage.large,
    coverImageColor: media.coverImage.color,
    bannerImage: media.bannerImage,
    format: media.format,
    episodes: media.episodes,
    chapters: media.chapters,
    seasonYear: media.seasonYear,
    averageScore: media.averageScore,
  };
}
