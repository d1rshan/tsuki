import Image from "next/image";
import { Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { Anime } from "@/lib/types";

export function AnimeHeader({
  anime,
  title,
  coverImage,
}: {
  anime: Anime;
  title: string;
  coverImage: string | null;
}) {
  return (
    <div className="relative z-10 -mt-20 flex flex-col gap-6 border-b pb-8 md:-mt-32 md:flex-row md:items-end md:gap-8">
      {/* Poster */}
      <div className="relative aspect-[3/4] w-40 shrink-0 overflow-hidden rounded-xl bg-muted ring-1 ring-border shadow-xl md:w-56">
        {coverImage ? (
          <Image
            src={coverImage}
            alt={title}
            fill
            sizes="(max-width: 768px) 160px, 224px"
            className="object-cover"
            priority
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted text-sm text-muted-foreground">
            No Image
          </div>
        )}
      </div>

      {/* Header Info */}
      <div className="flex flex-1 flex-col gap-2 pb-2 md:pb-4">
        <h1 className="text-3xl font-bold tracking-tight md:text-5xl">{title}</h1>

        {anime.titleNative && anime.titleNative !== title && (
          <p className="font-medium text-muted-foreground">{anime.titleNative}</p>
        )}

        <div className="mt-2 flex flex-wrap items-center gap-2">
          {anime.averageScore && (
            <Badge variant="secondary" className="flex items-center gap-1.5 font-medium">
              <Star className="h-3.5 w-3.5 fill-current text-yellow-500" />
              {anime.averageScore}%
            </Badge>
          )}
          {anime.format && <Badge variant="secondary">{anime.format}</Badge>}
          {anime.status && (
            <Badge variant="outline" className="text-muted-foreground">
              {anime.status}
            </Badge>
          )}
          {anime.season && anime.seasonYear && (
            <Badge variant="outline" className="text-muted-foreground">
              {`${anime.season} ${anime.seasonYear}`}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}
