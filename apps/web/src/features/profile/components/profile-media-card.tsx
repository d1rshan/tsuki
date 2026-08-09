import Link from "next/link";
import Image from "next/image";
import { Star } from "lucide-react";

import type { MediaCompact, MediaType } from "@tsuki/api/types";

import {
  MEDIA,
  getMediaCoverImage,
  getMediaTitle,
  mediaHref,
  mediaImageClass,
} from "@/features/media/media";
import { cn } from "@/shared/lib/utils";

interface ProfileMediaCardProps {
  media: MediaCompact;
  mediaType: MediaType;
  score?: number | null;
  /** Episodes watched or chapters read. */
  progress?: number | null;
}

export function ProfileMediaCard({ media, mediaType, score, progress }: ProfileMediaCardProps) {
  const cover = getMediaCoverImage(media);
  const title = getMediaTitle(media);

  return (
    <Link
      href={mediaHref(mediaType, media.id)}
      className="group relative flex aspect-[3/4] flex-col overflow-hidden rounded-xl bg-muted/30 outline-none transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 hover:ring-1 hover:ring-primary/50 focus-visible:ring-1 focus-visible:ring-primary"
    >
      {cover ? (
        <Image
          src={cover}
          alt={title}
          fill
          sizes="(max-width: 768px) 120px, 160px"
          className={cn(
            "object-cover transition-transform duration-500 group-hover:scale-105",
            mediaImageClass(mediaType),
          )}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-muted/50 p-4 text-center text-xs text-muted-foreground">
          {title}
        </div>
      )}

      {score ? (
        <div className="absolute top-2 right-2 z-10">
          <div className="bg-black/80 px-1.5 py-0.5 rounded-md flex items-center gap-1 text-[10px] font-semibold text-white shadow-sm">
            <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
            {score}
          </div>
        </div>
      ) : null}

      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none" />

      <div className="absolute inset-x-0 bottom-0 p-3 flex flex-col justify-end z-10 pointer-events-none">
        <span className="line-clamp-2 text-sm font-semibold text-white drop-shadow-sm transition-colors duration-300">
          {title}
        </span>
        {progress != null ? (
          <div className="mt-1 text-xs text-white/80 font-medium">
            {MEDIA[mediaType].unitAbbrev}. {progress}
          </div>
        ) : null}
      </div>
    </Link>
  );
}
