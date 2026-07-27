import { ClientError } from "graphql-request";

import { anilistClient } from "./client";
import { toMediaRow, toMediaCompactRow } from "./mappers";
import { MEDIA_BY_ID_QUERY, type MediaByIdResponse } from "./queries/media-by-id";
import { SEARCH_MEDIA_QUERY, type SearchMediaResponse } from "./queries/search";
import { TRENDING_MEDIA_QUERY, type TrendingMediaResponse } from "./queries/trending";
import type { MediaType } from "./types";

/**
 * Searches AniList for media of the given type.
 * Returns compact rows suitable for search results and grids.
 */
export async function fetchMediaSearch(
  type: MediaType,
  query: string,
  includeNsfw: boolean = false,
) {
  // Omitting `isAdult` entirely leaves the filter unset, which includes NSFW.
  const variables = includeNsfw ? { search: query, type } : { search: query, type, isAdult: false };
  const data = await anilistClient.request<SearchMediaResponse>(SEARCH_MEDIA_QUERY, variables);

  if (!data.Page?.media) return [];

  return data.Page.media.filter((media) => media != null).map(toMediaCompactRow);
}

/** Fetches the current trending media of the given type — two pages, 70 items. */
export async function fetchTrendingMedia(type: MediaType) {
  const [page1, page2] = await Promise.all([
    anilistClient.request<TrendingMediaResponse>(TRENDING_MEDIA_QUERY, {
      type,
      page: 1,
      perPage: 35,
    }),
    anilistClient.request<TrendingMediaResponse>(TRENDING_MEDIA_QUERY, {
      type,
      page: 2,
      perPage: 35,
    }),
  ]);

  const media = [...(page1.Page?.media ?? []), ...(page2.Page?.media ?? [])];

  return media.filter((item) => item != null).map(toMediaRow);
}

/**
 * Fetches a single media by its AniList id.
 * Returns null if no media of that type carries the id.
 */
export async function fetchMediaById(type: MediaType, id: number) {
  try {
    const data = await anilistClient.request<MediaByIdResponse>(MEDIA_BY_ID_QUERY, { id, type });
    return data.Media ? toMediaRow(data.Media) : null;
  } catch (error) {
    // AniList answers an unknown id with HTTP 404 and a `Not Found.` error entry.
    // graphql-request surfaces that as a thrown ClientError, so a plain null check
    // on the response never sees it.
    if (error instanceof ClientError && error.response.status === 404) return null;
    throw error;
  }
}
