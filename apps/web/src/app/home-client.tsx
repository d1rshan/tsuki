"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { trendingAnimeOptions } from "@/lib/queries";
import { AnimeCard } from "@/components/anime-card";

export function HomeClient() {
  const { data: trendingAnime } = useSuspenseQuery(trendingAnimeOptions);

  if (trendingAnime.length === 0) {
    return <p className="text-muted-foreground">Failed to load trending anime.</p>;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
      {trendingAnime.map((anime) => (
        <AnimeCard key={anime.id} anime={anime} />
      ))}
    </div>
  );
}
