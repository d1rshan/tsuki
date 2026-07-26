import { cacheLife } from "next/cache";
import { ErrorState } from "@/components/states";
import { DiscoverView } from "@/components/home/discover-view";

import { api } from "@/lib/api";

export default async function HomePage() {
  "use cache: remote";
  cacheLife("days");

  const [{ data: trendingAnime, error: animeError }, { data: trendingManga, error: mangaError }] =
    await Promise.all([api.anime.trending.get(), api.manga.trending.get()]);

  if (animeError || mangaError) {
    return <ErrorState message="Failed to load discover" description="Please try again later." />;
  }

  return <DiscoverView trendingAnime={trendingAnime} trendingManga={trendingManga} />;
}
