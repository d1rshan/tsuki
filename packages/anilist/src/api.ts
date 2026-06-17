import { anilistClient } from "./client";
import { SEARCH_ANIME_QUERY, type AnilistSearchResponse } from "./queries/search";
import { TRENDING_ANIME_QUERY, type TrendingQueryResponse } from "./queries/trending";
import { ANIME_BY_ID_QUERY, type AnimeByIdResponse } from "./queries/anime-by-id";
import { toAnimeRow, toAnimeCompactRow } from "./mappers";

/**
 * Searches AniList for anime matching the query string.
 * Returns an array of formatted Anime rows.
 */
export async function fetchAnimeSearch(query: string) {
  try {
    const data = await anilistClient.request<AnilistSearchResponse>(SEARCH_ANIME_QUERY, {
      search: query,
    });

    if (!data.Page?.media) return [];

    return data.Page.media
      .filter((anime) => anime != null)
      .map((anime) => toAnimeCompactRow(anime!));
  } catch (error) {
    console.error("[AniList] Failed to search anime:", error);
    return [];
  }
}

/**
 * Fetches the current trending anime from AniList.
 * Returns an array of formatted Anime rows.
 */
export async function fetchTrendingAnime() {
  try {
    const data = await anilistClient.request<TrendingQueryResponse>(TRENDING_ANIME_QUERY);

    if (!data.Page?.media) return [];

    return data.Page.media.filter((anime) => anime != null).map((anime) => toAnimeRow(anime!));
  } catch (error) {
    console.error("[AniList] Failed to fetch trending anime:", error);
    return [];
  }
}

/**
 * Fetches a specific anime by its AniList ID.
 * Returns the formatted Anime row, or null if not found.
 */
export async function fetchAnimeById(id: number) {
  try {
    const data = await anilistClient.request<AnimeByIdResponse>(ANIME_BY_ID_QUERY, { id });

    if (!data.Media) return null;

    return toAnimeRow(data.Media);
  } catch (error) {
    console.error(`[AniList] Failed to fetch anime ${id}:`, error);
    return null;
  }
}
