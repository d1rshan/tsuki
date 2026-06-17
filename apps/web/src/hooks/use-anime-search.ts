import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { type AnimeCompact } from "@/types/anime";
import { fetchAnimeSearch } from "@tsuki/anilist";

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
        fetchAnimeSearch(debouncedQuery),
      ]);

      const mergedAnime = new Map<number, AnimeCompact>();

      // 1. Process Anilist results (lowest priority, DB will overwrite if exists)
      if (anilistResult.status === "fulfilled" && anilistResult.value) {
        anilistResult.value.forEach((anime) => {
          mergedAnime.set(anime.id, anime as AnimeCompact);
        });
      }

      // 2. Process DB results (highest priority)
      if (dbResult.status === "fulfilled" && !dbResult.value.error && dbResult.value.data) {
        dbResult.value.data.forEach((anime) => {
          mergedAnime.set(anime.id, anime as AnimeCompact);
        });
      }

      // Return combined, deduplicated list
      return Array.from(mergedAnime.values());
    },
    enabled: debouncedQuery.length >= 3,
  });
}
