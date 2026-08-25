import { AnilistError, anilistRequest } from "../client";
import { toMediaRow, toMediaCompactRow, type MediaRow } from "./mappers";
import {
  MEDIA_BY_ID_QUERY,
  SEARCH_MEDIA_QUERY,
  TRENDING_MEDIA_QUERY,
  type MediaByIdResponse,
  type SearchMediaResponse,
  type TrendingMediaResponse,
} from "../queries";
import type { MediaType } from "../types";

export type { MediaRow };

/**
 * Searches AniList for media of the given type. Leaving `isAdult` unset is what
 * includes NSFW, so the filter is only omitted when `includeNsfw` is set.
 */
export async function anilistSearchMedia(
  type: MediaType,
  query: string,
  includeNsfw: boolean = false,
) {
  const variables = includeNsfw ? { search: query, type } : { search: query, type, isAdult: false };
  const data = await anilistRequest<SearchMediaResponse>(SEARCH_MEDIA_QUERY, variables);

  return (data.Page?.media ?? []).filter((media) => media != null).map(toMediaCompactRow);
}

/**
 * Two pages of trending media, 70 items, most trending first. Ties straddling
 * the page boundary can come back twice, so ids are deduped, first seen winning.
 */
export async function anilistTrendingMedia(type: MediaType) {
  const pages = await Promise.all(
    [1, 2].map((page) =>
      anilistRequest<TrendingMediaResponse>(TRENDING_MEDIA_QUERY, { type, page, perPage: 35 }),
    ),
  );

  const rows = pages
    .flatMap((page) => page.Page?.media ?? [])
    .filter((media) => media != null)
    .map(toMediaRow);

  return [...new Map(rows.map((row) => [row.id, row])).values()];
}

/**
 * Fetches one media by AniList id. Null when no media of that type carries it —
 * AniList answers those with a 404, which is raised rather than returned, so the
 * catch is the only place that sees them.
 */
export async function anilistMediaById(type: MediaType, id: number) {
  try {
    const data = await anilistRequest<MediaByIdResponse>(MEDIA_BY_ID_QUERY, { id, type });
    return data.Media ? toMediaRow(data.Media) : null;
  } catch (error) {
    if (error instanceof AnilistError && error.status === 404) return null;
    throw error;
  }
}
