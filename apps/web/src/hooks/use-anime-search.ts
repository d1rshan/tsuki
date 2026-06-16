import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { anilistClient, SEARCH_ANIME_QUERY, type AnilistSearchResponse } from "@/lib/anilist";
import { type Anime } from "@/types/anime";

// Custom hook for debouncing the input query
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

export function useAnimeSearch(query: string) {
  const debouncedQuery = useDebounce(query, 500);

  return useQuery({
    queryKey: ["anime-search", debouncedQuery],
    queryFn: async () => {
      if (debouncedQuery.length < 3) return [];

      const [dbResult, anilistResult] = await Promise.allSettled([
        api.anime.search.get({ query: { q: debouncedQuery } }),
        anilistClient.request<AnilistSearchResponse>(SEARCH_ANIME_QUERY, {
          search: debouncedQuery,
        }),
      ]);

      const mergedAnime = new Map<number, Anime>();

      // 1. Process Anilist results (lowest priority, DB will overwrite if exists)
      if (anilistResult.status === "fulfilled" && anilistResult.value?.Page?.media) {
        anilistResult.value.Page.media.forEach((anime: any) => {
          mergedAnime.set(anime.id, {
            id: anime.id,
            titleRomaji: anime.title?.romaji ?? null,
            titleEnglish: anime.title?.english ?? null,
            titleNative: anime.title?.native ?? null,
            description: anime.description ?? null,
            coverImageExtraLarge: anime.coverImage?.extraLarge ?? null,
            coverImageLarge: anime.coverImage?.large ?? null,
            coverImageColor: anime.coverImage?.color ?? null,
            bannerImage: anime.bannerImage ?? null,
            format: anime.format ?? null,
            status: anime.status ?? null,
            episodes: anime.episodes ?? null,
            duration: anime.duration ?? null,
            season: anime.season ?? null,
            seasonYear: anime.seasonYear ?? null,
            averageScore: anime.averageScore ?? null,
            meanScore: anime.meanScore ?? null,
            popularity: anime.popularity ?? null,
            trending: anime.trending ?? null,
            genres: anime.genres ?? null,
            tags: anime.tags ?? null,
            isAdult: anime.isAdult ?? false,
            createdAt: new Date(), // Local placeholders for missing fields
            updatedAt: new Date(),
          });
        });
      }

      // 2. Process DB results (highest priority)
      if (dbResult.status === "fulfilled" && !dbResult.value.error && dbResult.value.data) {
        dbResult.value.data.forEach((anime: Anime) => {
          mergedAnime.set(anime.id, anime);
        });
      }

      // Return combined, deduplicated list
      return Array.from(mergedAnime.values());
    },
    enabled: debouncedQuery.length >= 3,
  });
}
