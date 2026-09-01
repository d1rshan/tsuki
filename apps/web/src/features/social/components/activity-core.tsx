"use client";

import Image from "next/image";
import Link from "next/link";
import { format, formatDistanceToNow } from "date-fns";
import type { ReactNode } from "react";

import type { Activity } from "@tsuki/api/types";

import {
  logPhrase,
  mediaHref,
  mediaImageClass,
  normalizeMediaCompact,
} from "@/features/media/media";
import type { NormalizedMediaCompact } from "@/features/media/normalize";
import { SpoilerLayer } from "@/features/rich-content/components/spoiler-layer";
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
        className={cn("aspect-3/4 shrink-0 rounded-lg bg-muted ring-1 ring-border/50", className)}
        aria-hidden
      />
    );
  }

  return (
    <Link
      href={mediaHref(media.type, media.id)}
      className={cn(
        "relative block aspect-3/4 shrink-0 overflow-hidden rounded-lg bg-muted ring-1 ring-border/50",
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
    </Link>
  );
}

/**
 * The layout two purpose-built Activity cards share: cover, the phrase
 * sentence (actor slot + lead + title + tail), the details row, optional
 * extra content (a Review's rendered text), and a relative timestamp with
 * the full date on hover. `mode` is only the voice: social cards speak
 * "watched …", profile cards speak verb-first ("Watched …").
 */
export function ActivityCardCore({
  activity,
  mode,
  coverClassName,
  coverSizes,
  actor,
  review,
}: {
  activity: Activity;
  mode: "social" | "profile";
  coverClassName: string;
  coverSizes: string;
  /** Rendered before the lead; links to the actor's Profile. */
  actor?: ReactNode;
  /** Rendered beneath the details row; the profile passes nothing. */
  review?: ReactNode;
}) {
  const media = activity.media ? normalizeMediaCompact(activity.media) : null;
  // The media row can be missing (deleted or never fetched); the phrase still
  // speaks from the snapshot, using the activity's own media type.
  const mediaType = media?.type ?? activity.mediaType;
  const phrase =
    mediaType && activity.type === "LOG" ? logPhrase(mediaType, activity.snapshot, mode) : null;
  const lead =
    activity.type === "REVIEW"
      ? mode === "profile"
        ? "Reviewed"
        : "reviewed"
      : (phrase?.lead ?? (mode === "profile" ? "Updated" : "updated"));

  return (
    <div className="flex min-w-0 flex-1 gap-3">
      <ActivityCover media={media} className={coverClassName} sizes={coverSizes} />
      <div className="min-w-0 flex-1 space-y-1.5">
        <p className="text-sm leading-snug text-muted-foreground">
          {actor}
          {lead}{" "}
          {media ? (
            <Link
              href={mediaHref(media.type, media.id)}
              className="font-semibold text-foreground hover:text-primary"
            >
              {media.title}
            </Link>
          ) : (
            <span className="font-semibold text-foreground">Unknown Title</span>
          )}
          {phrase?.tail ? ` ${phrase.tail}` : null}
        </p>
        {phrase?.details ? <p className="text-sm">{phrase.details}</p> : null}
        {review}
        <time
          dateTime={activity.occurredAt.toISOString()}
          title={format(new Date(activity.occurredAt), "PPp")}
          className="block text-xs text-muted-foreground"
        >
          {formatDistanceToNow(new Date(activity.occurredAt), { addSuffix: true })}
        </time>
      </div>
    </div>
  );
}

/** The rendered review content a feed card shows inline. */
export function ActivityReviewContent({ html }: { html: string }) {
  return (
    <div className="text-sm text-foreground">
      <SpoilerLayer html={html} className="text-foreground/90" />
    </div>
  );
}
