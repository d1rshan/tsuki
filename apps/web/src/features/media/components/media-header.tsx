import Image from "next/image";
import { Star } from "lucide-react";

import type { Media } from "@tsuki/api/types";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/shared/lib/utils";

import { formatMediaStatus, mediaImageClass } from "../media";

export function MediaHeader({
  media,
  title,
  coverImage,
}: {
  media: Media;
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
            className={cn("object-cover", mediaImageClass(media.type))}
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

        {media.titleNative && media.titleNative !== title && (
          <p className="font-medium text-muted-foreground">{media.titleNative}</p>
        )}

        <div className="mt-2 flex flex-wrap items-center gap-2">
          {media.averageScore && (
            <Badge variant="secondary" className="flex items-center gap-1.5 font-medium">
              <Star className="h-3.5 w-3.5 fill-current text-yellow-500" />
              {media.averageScore}%
            </Badge>
          )}
          {media.format && <Badge variant="secondary">{media.format}</Badge>}
          {media.status && (
            <Badge variant="outline" className="uppercase text-muted-foreground">
              {formatMediaStatus(media.status)}
            </Badge>
          )}
          {media.season && media.seasonYear && (
            <Badge variant="outline" className="text-muted-foreground">
              {`${media.season} ${media.seasonYear}`}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}
