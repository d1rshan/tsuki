import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { fetchMangaSearch } from "@tsuki/anilist";

import { type MangaCompact } from "@/lib/types";

import { useDebounce } from "./use-debounce";

export function useMangaSearch(query: string, includeNsfw: boolean = false) {
  const debouncedQuery = useDebounce(query, 250);

  const queryResult = useQuery({
    queryKey: ["manga-search", debouncedQuery, includeNsfw],
    queryFn: async () => {
      if (debouncedQuery.length === 0) return [];

      const anilistResult = await fetchMangaSearch(debouncedQuery, includeNsfw);

      const mergedManga = new Map<number, MangaCompact>();

      if (anilistResult) {
        anilistResult.forEach((manga) => {
          mergedManga.set(manga.id, manga as MangaCompact);
        });
      }

      return Array.from(mergedManga.values());
    },
    enabled: debouncedQuery.length > 0,
    placeholderData: keepPreviousData,
  });

  return {
    ...queryResult,
    isDebouncing: query !== debouncedQuery,
  };
}
