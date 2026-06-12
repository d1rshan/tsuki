import { queryOptions } from "@tanstack/react-query";
import { urls } from "@/lib/urls";
import type { Anime } from "@/types/anime";

export const trendingAnimeOptions = queryOptions({
  queryKey: ["anime", "trending"],
  queryFn: async ({ signal }) => {
    try {
      const res = await fetch(`${urls.api}/anime/trending`, { signal });
      if (!res.ok) return [] as Anime[];
      return res.json() as Promise<Anime[]>;
    } catch {
      return [] as Anime[];
    }
  },
  staleTime: 1000 * 60 * 5,
});
