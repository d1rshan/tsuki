import { fetchMediaById, fetchTrendingMedia } from "@tsuki/anilist";
import { mediaDal } from "@tsuki/db";
import type { MediaType } from "@tsuki/db";

import { toApiMediaType, type Media, type MediaCompact } from "./model";

type MediaRow = NonNullable<Awaited<ReturnType<typeof mediaDal.getMediaById>>>;
type MediaCompactRow = Awaited<ReturnType<typeof mediaDal.searchMedia>>[number];

/** Episodes or chapters, whichever unit the media counts. */
const unitCount = (row: { type: MediaType; episodes: number | null; chapters: number | null }) =>
  row.type === "ANIME" ? row.episodes : row.chapters;

export function toMediaCompact(row: MediaCompactRow): MediaCompact {
  return {
    id: row.id,
    type: toApiMediaType(row.type),
    titleRomaji: row.titleRomaji,
    titleEnglish: row.titleEnglish,
    titleNative: row.titleNative,
    coverImageExtraLarge: row.coverImageExtraLarge,
    coverImageLarge: row.coverImageLarge,
    coverImageColor: row.coverImageColor,
    bannerImage: row.bannerImage,
    format: row.format,
    unitCount: unitCount(row),
    seasonYear: row.seasonYear,
    averageScore: row.averageScore,
  };
}

export function toMedia(row: MediaRow): Media {
  return {
    ...toMediaCompact(row),
    idMal: row.idMal,
    synonyms: row.synonyms,
    description: row.description,
    coverImageMedium: row.coverImageMedium,
    status: row.status,
    source: row.source,
    countryOfOrigin: row.countryOfOrigin,
    episodes: row.episodes,
    duration: row.duration,
    chapters: row.chapters,
    volumes: row.volumes,
    startDate: row.startDate,
    endDate: row.endDate,
    season: row.season,
    meanScore: row.meanScore,
    popularity: row.popularity,
    favourites: row.favourites,
    genres: row.genres,
    tags: row.tags,
    trailer: row.trailer,
    externalLinks: row.externalLinks,
    siteUrl: row.siteUrl,
    isAdult: row.isAdult,
  };
}

/**
 * Read-through cache: serve from our table, else pull from AniList and persist.
 * Returns null only when AniList has no such media of that type.
 */
export async function getMedia(type: MediaType, id: number) {
  const cached = await mediaDal.getMediaById(type, id);
  if (cached) return cached;

  const fetched = await fetchMediaById(type, id);
  if (!fetched) return null;

  await mediaDal.upsertMedia([fetched]);
  return mediaDal.getMediaById(type, id);
}

/**
 * Library entries and reviews carry a foreign key to media, so the row has to
 * exist before either can be written. Logging from a search result or a profile
 * grid is a cache miss, which is why this cannot be assumed.
 */
export async function ensureMediaExists(type: MediaType, id: number) {
  return (await getMedia(type, id)) != null;
}

const TRENDING_LIMIT = 70;
const TRENDING_TTL_MS = 6 * 60 * 60 * 1000;

/**
 * Read-through, same as getMedia: serve what we hold and refresh from AniList
 * only when it goes stale.
 *
 * AniList is regularly unreachable (Cloudflare 522s, connection resets), and we
 * already persist every trending row we fetch, so a failed refresh falls back to
 * the cached ranking rather than failing the whole discover page.
 */
export async function getTrending(type: MediaType) {
  const cached = await mediaDal.getTrendingMedia(type, TRENDING_LIMIT);
  const syncedAt = cached[0]?.syncedAt;
  const isFresh = syncedAt != null && Date.now() - syncedAt.getTime() < TRENDING_TTL_MS;

  if (cached.length > 0 && isFresh) return cached.map(toMediaCompact);

  try {
    await mediaDal.upsertMedia(await fetchTrendingMedia(type));
    const refreshed = await mediaDal.getTrendingMedia(type, TRENDING_LIMIT);
    return refreshed.map(toMediaCompact);
  } catch (error) {
    if (cached.length > 0) {
      console.error(`[media] trending refresh failed for ${type}, serving cached:`, error);
      return cached.map(toMediaCompact);
    }
    throw error;
  }
}

export async function search(type: MediaType, query: string) {
  const rows = await mediaDal.searchMedia(type, query);
  return rows.map(toMediaCompact);
}
