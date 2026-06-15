import { queryOptions } from "@tanstack/react-query";
import { api } from "@/lib/api";

export const trendingAnimeOptions = queryOptions({
  queryKey: ["anime", "trending"],
  queryFn: async ({ signal }) => {
    try {
      const { data, error } = await api.anime.trending.get({
        fetch: { signal },
      });

      if (error) return [];

      return data;
    } catch {
      return [];
    }
  },
  staleTime: 1000 * 60 * 5,
});

export const animeDetailOptions = (id: number) =>
  queryOptions({
    queryKey: ["anime", id],
    queryFn: async ({ signal }) => {
      try {
        const { data, error } = await api.anime({ id }).get({
          fetch: { signal },
        });

        if (error || !data) return null;

        return data;
      } catch {
        return null;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
