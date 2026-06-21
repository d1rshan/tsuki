import { type AnimeCompact } from "@/lib/types";

import { AnimeCard } from "./anime-card";

export function AnimeGrid({ animes }: { animes: AnimeCompact[] }) {
  return (
    <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
      {animes.map((anime) => (
        <AnimeCard key={anime.id} anime={anime} />
      ))}
    </div>
  );
}
