import { useQuery, keepPreviousData } from "@tanstack/react-query";

import type { MediaType } from "@tsuki/api/types";

import { apiClient } from "@/shared/lib/api-client";

import { useDebouncedValue } from "@/shared/hooks/use-debounced-value";

import { mediaKeys } from "../query-keys";

export function useMediaSearch(mediaType: MediaType, query: string) {
  const debouncedQuery = useDebouncedValue(query, 250);

  const queryResult = useQuery({
    queryKey: mediaKeys.search(mediaType, debouncedQuery),
    queryFn: async () => {
      const { data, error } = await apiClient
        .media({ type: mediaType })
        .search.get({ query: { q: debouncedQuery, limit: 24 } });

      if (error) throw error;
      return data;
    },
    enabled: debouncedQuery.length > 0,
    placeholderData: keepPreviousData,
  });

  return {
    ...queryResult,
    isPending: queryResult.isFetching || query !== debouncedQuery,
  };
}
