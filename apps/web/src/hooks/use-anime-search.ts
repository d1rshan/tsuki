import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { fetchAnimeSearch } from "@tsuki/anilist";

import { type AnimeCompact } from "@/lib/types";

import { useDebounce } from "./use-debounce";

export function useAnimeSearch(query: string, includeNsfw: boolean = false) {
  const debouncedQuery = useDebounce(query, 250);

  const queryResult = useQuery({
    queryKey: ["anime-search", debouncedQuery, includeNsfw],
    queryFn: async () => {
      if (debouncedQuery.length === 0) return [];

      // const [dbResult, anilistResult] = await Promise.allSettled([
      //   api.anime.search.get({ query: { q: debouncedQuery } }),
      //   fetchAnimeSearch(debouncedQuery),
      // ]);

      const anilistResult = await fetchAnimeSearch(debouncedQuery, includeNsfw);

      const mergedAnime = new Map<number, AnimeCompact>();

      // 1. Process Anilist results (lowest priority, DB will overwrite if exists)
      if (anilistResult) {
        anilistResult.forEach((anime) => {
          mergedAnime.set(anime.id, anime as AnimeCompact);
        });
      }

      // 2. Process DB results (highest priority)
      // if (dbResult.status === "fulfilled" && !dbResult.value.error && dbResult.value.data) {
      //   dbResult.value.data.forEach((anime) => {
      //     mergedAnime.set(anime.id, anime as AnimeCompact);
      //   });
      // }

      // Return combined, deduplicated list
      return Array.from(mergedAnime.values());
    },
    enabled: debouncedQuery.length > 0,
    placeholderData: keepPreviousData,
  });

  return {
    ...queryResult,
    isDebouncing: query !== debouncedQuery,
  };
}
