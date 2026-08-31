"use client";

import { useInfiniteQuery } from "@tanstack/react-query";

import { apiClient } from "@/shared/lib/api-client";

/** Mirrors the social feed's infinite cursor pattern, scoped to one profile. */
export function useProfileActivity(username: string) {
  return useInfiniteQuery({
    queryKey: ["profile", username, "activity"],
    queryFn: async ({ pageParam }) => {
      const { data, error } = await apiClient
        .users({ username })
        .activity.get({ query: pageParam ? { cursor: pageParam } : {} });
      if (error || !data) throw error ?? new Error("Failed to load Activity");

      return data;
    },
    initialPageParam: null as string | null,
    getNextPageParam: (page) => page.nextCursor,
  });
}
