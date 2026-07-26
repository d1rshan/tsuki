import { anilistClient } from "./client";
import { SEARCH_ANIME_QUERY, type AnilistSearchResponse } from "./queries/search";
import { TRENDING_ANIME_QUERY, type TrendingQueryResponse } from "./queries/trending";
import { ANIME_BY_ID_QUERY, type AnimeByIdResponse } from "./queries/anime-by-id";
import { SEARCH_MANGA_QUERY, type AnilistMangaSearchResponse } from "./queries/manga-search";
import { TRENDING_MANGA_QUERY, type TrendingMangaQueryResponse } from "./queries/trending-manga";
import { MANGA_BY_ID_QUERY, type MangaByIdResponse } from "./queries/manga-by-id";
import { toAnimeRow, toAnimeCompactRow, toMangaRow, toMangaCompactRow } from "./mappers";

/**
 * Searches AniList for anime matching the query string.
 * Returns an array of formatted Anime rows.
 */
export async function fetchAnimeSearch(query: string, includeNsfw: boolean = false) {
  const variables = includeNsfw ? { search: query } : { search: query, isAdult: false };
  const data = await anilistClient.request<AnilistSearchResponse>(SEARCH_ANIME_QUERY, variables);

  if (!data.Page?.media) return [];

  return data.Page.media.filter((anime) => anime != null).map((anime) => toAnimeCompactRow(anime!));
}

/**
 * Fetches the current trending anime from AniList.
 * Returns an array of formatted Anime rows.
 */
export async function fetchTrendingAnime() {
  const [page1, page2] = await Promise.all([
    anilistClient.request<TrendingQueryResponse>(TRENDING_ANIME_QUERY, { page: 1, perPage: 35 }),
    anilistClient.request<TrendingQueryResponse>(TRENDING_ANIME_QUERY, { page: 2, perPage: 35 }),
  ]);

  const media = [...(page1.Page?.media || []), ...(page2.Page?.media || [])];

  return media.filter((anime) => anime != null).map((anime) => toAnimeRow(anime!));
}

/**
 * Fetches a specific anime by its AniList ID.
 * Returns the formatted Anime row, or null if not found.
 */
export async function fetchAnimeById(id: number) {
  const data = await anilistClient.request<AnimeByIdResponse>(ANIME_BY_ID_QUERY, { id });

  if (!data.Media) return null;

  return toAnimeRow(data.Media);
}

/**
 * Searches AniList for manga matching the query string.
 * Returns an array of formatted Manga rows.
 */
export async function fetchMangaSearch(query: string, includeNsfw: boolean = false) {
  const variables = includeNsfw ? { search: query } : { search: query, isAdult: false };
  const data = await anilistClient.request<AnilistMangaSearchResponse>(
    SEARCH_MANGA_QUERY,
    variables,
  );

  if (!data.Page?.media) return [];

  return data.Page.media.filter((manga) => manga != null).map((manga) => toMangaCompactRow(manga!));
}

/**
 * Fetches the current trending manga from AniList.
 * Returns an array of formatted Manga rows.
 */
export async function fetchTrendingManga() {
  const [page1, page2] = await Promise.all([
    anilistClient.request<TrendingMangaQueryResponse>(TRENDING_MANGA_QUERY, {
      page: 1,
      perPage: 35,
    }),
    anilistClient.request<TrendingMangaQueryResponse>(TRENDING_MANGA_QUERY, {
      page: 2,
      perPage: 35,
    }),
  ]);

  const media = [...(page1.Page?.media || []), ...(page2.Page?.media || [])];

  return media.filter((manga) => manga != null).map((manga) => toMangaRow(manga!));
}

/**
 * Fetches a specific manga by its AniList ID.
 * Returns the formatted Manga row, or null if not found.
 */
export async function fetchMangaById(id: number) {
  const data = await anilistClient.request<MangaByIdResponse>(MANGA_BY_ID_QUERY, { id });

  if (!data.Media) return null;

  return toMangaRow(data.Media);
}
