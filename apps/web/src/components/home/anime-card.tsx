import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { type Anime } from "@/types/anime";

type AnimeCardProps = {
  anime: Anime;
};

export function AnimeCard({ anime }: AnimeCardProps) {
  const title = anime.titleEnglish || anime.titleRomaji || anime.titleNative || "Unknown Title";
  const coverImage = anime.coverImageExtraLarge || anime.coverImageLarge || "";

  const metadata = [anime.seasonYear, anime.episodes ? `${anime.episodes} eps` : null]
    .filter(Boolean)
    .join(" • ");

  return (
    <Link href={`/anime/${anime.id}`} className="block group">
      <div className="relative overflow-hidden rounded-xl ring-1 ring-border/50 bg-muted transition-all duration-300 group-hover:ring-border group-hover:shadow-lg">
        <AspectRatio ratio={3 / 4}>
          {coverImage ? (
            <Image
              src={coverImage}
              alt={title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 16vw"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted text-xs text-muted-foreground">
              No Image
            </div>
          )}
        </AspectRatio>

        {anime.averageScore && (
          <div className="absolute right-2 top-2 flex items-center gap-1 rounded-md bg-black/30 backdrop-blur-md px-1.5 py-0.5 text-xs font-medium text-white shadow-sm ring-1 ring-white/20">
            <Star className="h-3 w-3 fill-current text-yellow-400" />
            {anime.averageScore}%
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-4 pt-12">
          <h3 className="line-clamp-1 text-sm font-semibold text-white transition-colors group-hover:text-primary">
            {title}
          </h3>
          {metadata && (
            <p className="line-clamp-1 mt-0.5 text-xs font-medium text-white/80">{metadata}</p>
          )}
        </div>
      </div>
    </Link>
  );
}
