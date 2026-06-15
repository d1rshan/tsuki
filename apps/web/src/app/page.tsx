import { Suspense } from "react";
import { cacheLife, cacheTag } from "next/cache";

import { api } from "@/lib/api";
import { AnimeCard } from "@/components/home/anime-card";
import { Loader } from "@/components/loader";

export default function Home() {
  return (
    <Suspense fallback={<Loader />}>
      <div className="container mx-auto px-4 pt-24">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Trending Now</h1>
        </div>
        <TrendingGrid />
      </div>
    </Suspense>
  );
}

async function TrendingGrid() {
  "use cache: remote";
  cacheLife("days");
  cacheTag("trending-anime");

  const { data: trendingAnime, error } = await api.anime.trending.get();
  if (error) return <div>ERROR!</div>;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
      {trendingAnime.map((anime) => (
        <AnimeCard key={anime.id} anime={anime} />
      ))}
    </div>
  );
}
