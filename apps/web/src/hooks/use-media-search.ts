import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { fetchAnimeSearch, fetchMangaSearch } from "@tsuki/anilist";

import { type AnimeCompact, type MangaCompact } from "@/lib/types";
import { type MediaType } from "@/lib/media";

import { useDebounce } from "./use-debounce";

const FETCHERS = {
  anime: fetchAnimeSearch,
  manga: fetchMangaSearch,
} satisfies Record<MediaType, unknown>;

export function useMediaSearch(mediaType: MediaType, query: string, includeNsfw: boolean = false) {
  const debouncedQuery = useDebounce(query, 250);

  const queryResult = useQuery({
    queryKey: [`${mediaType}-search`, debouncedQuery, includeNsfw],
    queryFn: async () => {
      if (debouncedQuery.length === 0) return [];

      const results = await FETCHERS[mediaType](debouncedQuery, includeNsfw);

      // Deduplicate by AniList id.
      const merged = new Map<number, AnimeCompact | MangaCompact>();
      results?.forEach((media) => {
        merged.set(media.id, media as AnimeCompact | MangaCompact);
      });

      return Array.from(merged.values());
    },
    enabled: debouncedQuery.length > 0,
    placeholderData: keepPreviousData,
  });

  return {
    ...queryResult,
    isDebouncing: query !== debouncedQuery,
  };
}
