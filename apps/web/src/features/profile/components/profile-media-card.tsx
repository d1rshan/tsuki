import Link from "next/link";
import Image from "next/image";

import type { MediaCompact, MediaType } from "@tsuki/api/types";

import { MEDIA, mediaHref, mediaImageClass, normalizeMediaCompact } from "@/features/media/media";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
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

const RING_RADIUS = 13;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

export function ProfileMediaCard({
  media,
  mediaType,
  score,
  progress,
  hideTitle,
}: ProfileMediaCardProps) {
  const { coverImage: cover, title, count: total } = normalizeMediaCompact(media);
  const ratio = progress != null && total ? Math.min(progress / total, 1) : null;

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

      {progress != null || score != null ? (
        <div className="absolute top-2 right-2 z-10">
          <TooltipProvider delay={80}>
            <Tooltip>
              <TooltipTrigger
                render={
                  <span className="relative flex size-7 items-center justify-center rounded-full bg-background/60 text-[10px] font-semibold backdrop-blur-md" />
                }
              >
                <svg viewBox="0 0 32 32" className="absolute inset-0 size-full -rotate-90">
                  <circle
                    cx="16"
                    cy="16"
                    r={RING_RADIUS}
                    fill="none"
                    strokeWidth="3"
                    className="stroke-foreground/15"
                  />
                  <circle
                    cx="16"
                    cy="16"
                    r={RING_RADIUS}
                    fill="none"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray={RING_CIRCUMFERENCE}
                    strokeDashoffset={RING_CIRCUMFERENCE * (1 - (ratio ?? 0))}
                    className="stroke-primary"
                  />
                </svg>
                {progress != null ? <span className="relative">{progress}</span> : null}
              </TooltipTrigger>
              <TooltipContent>
                {[
                  progress != null
                    ? total
                      ? `${progress}/${total} ${MEDIA[mediaType].unitLong.toLowerCase()}`
                      : `${MEDIA[mediaType].unitAbbrev}. ${progress}`
                    : null,
                  score != null ? `Rated ${score}/10` : null,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      ) : null}

      {hideTitle ? null : (
        <>
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 pointer-events-none" />

          <div className="absolute inset-x-0 bottom-0 p-3 flex flex-col justify-end z-10 pointer-events-none">
            <span className="line-clamp-2 text-sm font-semibold text-white drop-shadow-sm">
              {title}
            </span>
          </div>
        </>
      )}
    </Link>
  );
}
