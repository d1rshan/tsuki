import { AnimeCard } from "@/components/anime-card";
import { getTrendingAnime } from "@/services/anilist";
import { type Anime } from "@/types/anime";

export default async function Home() {
  const trendingAnime: Anime[] = await getTrendingAnime();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Trending Now</h1>
      </div>

      {trendingAnime.length === 0 ? (
        <p className="text-muted-foreground">Failed to load trending anime. Ensure the API proxy is running.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {trendingAnime.map((anime) => (
            <AnimeCard key={anime.id} anime={anime} />
          ))}
        </div>
      )}
    </div>
  );
}
