import Image from "next/image";
import Link from "next/link";

interface Anime {
  id: number;
  title: { romaji: string; english: string | null };
  coverImage: { large: string };
}

async function getTrendingAnime() {
  try {
    const res = await fetch("http://localhost:3001/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `
          query {
            Page(page: 1, perPage: 12) {
              media(type: ANIME, sort: TRENDING_DESC) {
                id
                title {
                  romaji
                  english
                }
                coverImage {
                  large
                }
              }
            }
          }
        `,
      }),
      next: { revalidate: 3600 } 
    });
    
    const data = await res.json();
    return data?.data?.Page?.media || [];
  } catch (error) {
    console.error(error);
    return [];
  }
}

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
            <Link key={anime.id} href={`/anime/${anime.id}`} className="group relative flex flex-col space-y-2">
              <div className="aspect-[2/3] overflow-hidden rounded-md bg-muted relative">
                <Image
                  src={anime.coverImage.large}
                  alt={anime.title.english || anime.title.romaji}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 16vw"
                />
              </div>
              <div className="space-y-1 text-sm">
                <h3 className="font-medium leading-none line-clamp-1">{anime.title.english || anime.title.romaji}</h3>
                <p className="text-xs text-muted-foreground line-clamp-1">{anime.title.romaji}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
