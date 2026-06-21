import Link from "next/link";
import Image from "next/image";
import { Star } from "lucide-react";

import { getAnimeCoverImage, getAnimeTitle } from "@/lib/anime";
import type { LibraryEntry } from "@/lib/types";

type Anime = NonNullable<LibraryEntry["anime"]>;

interface ProfileAnimeCardProps {
  anime: Anime;
  rating?: number | null;
  episodesWatched?: number | null;
}

export function ProfileAnimeCard({ anime, rating, episodesWatched }: ProfileAnimeCardProps) {
  const cover = getAnimeCoverImage(anime);
  const title = getAnimeTitle(anime);

  return (
    <Link
      href={`/anime/${anime.id}`}
      className="group relative aspect-[3/4] flex flex-col overflow-hidden rounded-xl bg-muted/30 outline-none transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 hover:ring-1 hover:ring-primary/50 focus-visible:ring-1 focus-visible:ring-primary"
    >
      {cover ? (
        <Image
          src={cover}
          alt={title}
          fill
          sizes="(max-width: 768px) 120px, 160px"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center p-4 text-center text-xs text-muted-foreground bg-gradient-to-br from-muted to-muted/50">
          {title}
        </div>
      )}

      {rating ? (
        <div className="absolute top-2 right-2 z-10">
          <div className="bg-black/80 px-1.5 py-0.5 rounded-md flex items-center gap-1 text-[10px] font-semibold text-white shadow-sm">
            <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
            {rating}
          </div>
        </div>
      ) : null}

      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none" />

      <div className="absolute inset-x-0 bottom-0 p-3 flex flex-col justify-end z-10 pointer-events-none">
        <span className="line-clamp-2 text-sm font-semibold text-white drop-shadow-sm transition-colors duration-300">
          {title}
        </span>
        {episodesWatched != null ? (
          <div className="mt-1 text-xs text-white/80 font-medium">Ep. {episodesWatched}</div>
        ) : null}
      </div>
    </Link>
  );
}
