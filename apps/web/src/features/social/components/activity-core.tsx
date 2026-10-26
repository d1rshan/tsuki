"use client";

import Image from "next/image";
import { format, formatDistanceToNow } from "date-fns";
import type { ReactNode } from "react";

import type { Activity } from "@tsuki/api/types";

import { MediaLink } from "@/features/media/components/media-link";
import { logPhrase, mediaImageClass, normalizeMediaCompact } from "@/features/media/media";
import type { NormalizedMediaCompact } from "@/features/media/normalize";
import { cn } from "@/shared/lib/utils";

/**
 * The media's cover: links to the media page, or degrades to a placeholder
 * block when the media record is missing.
 */
function ActivityCover({
  media,
  className,
  sizes,
}: {
  media: NormalizedMediaCompact | null;
  className?: string;
  sizes: string;
}) {
  if (!media) {
    return (
      <div
        className={cn(
          "aspect-3/4 shrink-0 self-start rounded-lg border border-card bg-muted",
          className,
        )}
        aria-hidden
      />
    );
  }

  return (
    <MediaLink
      media={media}
      className={cn(
        "relative block aspect-3/4 shrink-0 self-start overflow-hidden rounded-lg border border-card bg-muted",
        className,
      )}
    >
      {media.coverImage ? (
        <Image
          src={media.coverImage}
          alt={media.title}
          fill
          sizes={sizes}
          className={cn("object-cover", mediaImageClass(media.type))}
        />
      ) : (
        <div className="flex size-full items-center justify-center text-xs text-muted-foreground">
          No Image
        </div>
      )}
    </MediaLink>
  );
}

/** Shared Log cover, event sentence, and relative time. */
export function ActivityCardCore({
  activity,
  coverClassName,
  coverSizes,
  actor,
  footer,
}: {
  activity: Activity;
  coverClassName: string;
  coverSizes: string;
  /** Rendered above the lead; links to the actor's Profile. */
  actor?: ReactNode;
  /** Rendered at the bottom of the content column. */
  footer?: ReactNode;
}) {
  const media = activity.media ? normalizeMediaCompact(activity.media) : null;
  // The media row can be missing (deleted or never fetched); the phrase still
  // speaks from the snapshot, using the activity's own media type.
  const mediaType = media?.type ?? activity.mediaType;
  const phrase = mediaType ? logPhrase(mediaType, activity.snapshot) : null;
  if (!phrase) return null;

  return (
    <div className="flex min-w-0 flex-1 gap-3">
      <ActivityCover media={media} className={coverClassName} sizes={coverSizes} />
      <div className="min-w-0 flex-1">
        <div className="mb-1.5 flex items-baseline justify-between gap-3">
          {actor}
          <time
            dateTime={activity.occurredAt.toISOString()}
            title={format(new Date(activity.occurredAt), "PPp")}
            className="shrink-0 text-xs text-muted-foreground"
          >
            {formatDistanceToNow(new Date(activity.occurredAt), { addSuffix: true })}
          </time>
        </div>
        <p className="text-sm leading-snug text-muted-foreground">
          {phrase.lead}{" "}
          {media ? (
            <MediaLink media={media} className="font-medium text-inherit hover:text-primary">
              {media.title}
            </MediaLink>
          ) : (
            <span className="font-medium">Unknown Title</span>
          )}
          {phrase?.tail ? ` ${phrase.tail}` : null}
        </p>
        {footer}
      </div>
    </div>
  );
}
