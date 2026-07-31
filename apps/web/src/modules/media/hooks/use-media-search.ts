import { useQuery, keepPreviousData } from "@tanstack/react-query";

import { anilistSearchMedia } from "@tsuki/anilist";
import type { MediaType } from "@tsuki/api/types";

import { useDebounce } from "@/hooks/use-debounce";

import { mediaKeys } from "../query-keys";

// Search goes to AniList straight from the browser, deliberately: it keeps the
// full catalogue reachable without proxying every keystroke through our API.
// Our own media table only holds titles someone has already opened, so
// searching it would return a strict subset — there is no server-side search
// endpoint for that reason. AniList's rows already match MediaCompact.

export function useMediaSearch(mediaType: MediaType, query: string, includeNsfw: boolean = false) {
  const debouncedQuery = useDebounce(query, 250);

  const queryResult = useQuery({
    queryKey: mediaKeys.search(mediaType, debouncedQuery, includeNsfw),
    queryFn: async () => {
      if (debouncedQuery.length === 0) return [];

      const results = await anilistSearchMedia(mediaType, debouncedQuery, includeNsfw);

      // Deduplicate by AniList id.
      return [...new Map(results.map((row) => [row.id, row])).values()];
    },
    enabled: debouncedQuery.length > 0,
    placeholderData: keepPreviousData,
  });

  return {
    ...queryResult,
    isDebouncing: query !== debouncedQuery,
  };
}
