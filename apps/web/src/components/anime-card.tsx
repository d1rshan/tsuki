import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";

import { type Anime } from "@/types/anime";

type AnimeCardProps = {
  anime: Anime;
};

export function AnimeCard({ anime }: AnimeCardProps) {
  return (
    <Link href={`/anime/${anime.id}`} className="block group">
      <Card className="overflow-hidden transition-all hover:ring-4 hover:ring-primary/50 relative border-0 shadow-md rounded-xl bg-transparent">
        <AspectRatio ratio={3 / 4} className="bg-muted">
          <Image
            src={anime.coverImage.large}
            alt={anime.title.english || anime.title.romaji}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 16vw"
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-100" />

          {/* Text Content overlaying the image */}
          <div className="absolute bottom-0 left-0 right-0 p-4 text-white translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
            <h3 className="font-bold leading-tight line-clamp-2 text-sm sm:text-base drop-shadow-md">
              {anime.title.english || anime.title.romaji}
            </h3>
            <p className="text-xs text-white/80 line-clamp-1 mt-1 drop-shadow-md">
              {anime.title.romaji}
            </p>
          </div>
        </AspectRatio>
      </Card>
    </Link>
  );
}
