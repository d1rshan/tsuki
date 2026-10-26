import Image from "next/image";
import { Star } from "lucide-react";

import type { MediaCompact, MediaType } from "@tsuki/api/types";

import { MediaLink } from "@/features/media/components/media-link";
import { MEDIA, mediaImageClass, normalizeMediaCompact } from "@/features/media/media";
import { cn } from "@/shared/lib/utils";

interface ProfileMediaCardProps {
  media: MediaCompact;
  mediaType: MediaType;
  score?: number | null;
  /** Episodes watched or chapters read. */
  progress?: number | null;
}

export function ProfileMediaCard({ media, mediaType, score, progress }: ProfileMediaCardProps) {
  const { coverImage, title, count: total } = normalizeMediaCompact(media);

  return (
    <MediaLink
      media={media}
      className="group block min-w-0 rounded-xl bg-muted p-2 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
    >
      <div className="relative aspect-[3/4] overflow-hidden rounded-lg">
        {coverImage ? (
          <Image
            src={coverImage}
            alt={title}
            fill
            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 22vw"
            className={cn("object-cover", mediaImageClass(mediaType))}
          />
        ) : (
          <div className="flex size-full items-center justify-center text-xs text-muted-foreground">
            No Image
          </div>
        )}
      </div>
      <div className="px-1 pt-3 pb-1">
        <h3
          className="truncate text-sm leading-snug font-semibold text-muted-foreground transition-colors group-hover:text-foreground group-focus-visible:text-foreground"
          title={title}
        >
          {title}
        </h3>
        {progress != null || score != null ? (
          <div className="mt-2 flex flex-wrap items-center justify-between gap-x-2 gap-y-1 text-xs text-muted-foreground tabular-nums">
            {progress != null && (
              <span
                aria-label={`${progress}${total ? ` of ${total}` : ""} ${MEDIA[mediaType].unitLong.toLowerCase()}`}
              >
                <span className="font-medium text-foreground">{progress}</span>
                {total ? ` / ${total}` : ""} {MEDIA[mediaType].unitAbbrev.toLowerCase()}.
              </span>
            )}
            {score != null && (
              <span className="flex items-center gap-1" aria-label={`Rated ${score} out of 10`}>
                <Star className="size-3" aria-hidden />
                <span className="font-medium text-foreground">{score}</span>
              </span>
            )}
          </div>
        ) : null}
      </div>
    </MediaLink>
  );
}
