import Link from "next/link";
import Image from "next/image";
import { Star } from "lucide-react";

import type { MediaCompact, MediaType } from "@tsuki/api/types";

import { MEDIA, mediaHref, mediaImageClass, normalizeMediaCompact } from "@/features/media/media";
import { cn } from "@/shared/lib/utils";

interface ProfileMediaCardProps {
  media: MediaCompact;
  mediaType: MediaType;
  score?: number | null;
  /** Episodes watched or chapters read. */
  progress?: number | null;
  /** Hide the title overlay. */
  hideTitle?: boolean;
}

export function ProfileMediaCard({
  media,
  mediaType,
  score,
  progress,
  hideTitle,
}: ProfileMediaCardProps) {
  const { coverImage: cover, title } = normalizeMediaCompact(media);

  return (
    <Link
      href={mediaHref(mediaType, media.id)}
      className="group relative flex aspect-[3/4] flex-col overflow-hidden rounded-xl bg-muted/30 outline-none transition-shadow duration-300 hover:shadow-md focus-visible:ring-1 focus-visible:ring-primary"
    >
      {cover ? (
        <Image
          src={cover}
          alt={title}
          fill
          sizes="(max-width: 768px) 120px, 160px"
          className={cn(
            "object-cover transition-transform duration-150 group-hover:scale-[1.03]",
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
            <Star className="w-3 h-3 fill-primary text-primary" />
            {score}
          </div>
        </div>
      ) : null}

      {hideTitle ? null : (
        <>
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 pointer-events-none" />

          <div className="absolute inset-x-0 bottom-0 p-3 flex flex-col justify-end z-10 pointer-events-none">
            <span className="line-clamp-2 text-sm font-semibold text-white drop-shadow-sm">
              {title}
            </span>
            {progress != null ? (
              <div className="mt-1 text-xs text-white/80 font-medium">
                {MEDIA[mediaType].unitAbbrev}. {progress}
              </div>
            ) : null}
          </div>
        </>
      )}
    </Link>
  );
}
