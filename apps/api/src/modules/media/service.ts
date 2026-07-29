import { fetchMediaById, fetchTrendingMedia } from "@tsuki/anilist";
import { mediaDal } from "@tsuki/db";
import type { MediaType } from "@tsuki/db";

import { toApiMediaType, type Media, type MediaCompact } from "./model";

type MediaRow = NonNullable<Awaited<ReturnType<typeof mediaDal.getMediaById>>>;
type MediaCompactRow = mediaDal.MediaCompactRow;

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

/**
 * Unlike getMedia, this is not a read-through. AniList's `trending` is a rolling
 * count of activity in the past hour, so a stored copy is a snapshot of a moving
 * rate — rows synced at different times aren't comparable, and ranking by them
 * drifts from AniList's real order. We take the ordering live and let the
 * caller's cache absorb the cost.
 *
 * Rows are still persisted so opening a title from the carousel is a local hit.
 */
export async function getTrending(type: MediaType) {
  const rows = await fetchTrendingMedia(type);
  await mediaDal.upsertMedia(rows);

  return rows.map(toMediaCompact);
}
