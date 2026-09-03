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
        className={cn(
          "aspect-3/4 shrink-0 self-start rounded-lg bg-muted ring-1 ring-border/50",
          className,
        )}
        aria-hidden
      />
    );
  }

  return (
    <Link
      href={mediaHref(media.type, media.id)}
      className={cn(
        "relative block aspect-3/4 shrink-0 self-start overflow-hidden rounded-lg bg-muted ring-1 ring-border/50",
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
 * The layout two purpose-built Activity cards share: cover on the left; the
 * actor slot (social), the phrase sentence — lead + title link + tail — and
 * optional extra content (a Review's rendered text) on the right, with the
 * relative timestamp (full date on hover) pinned top-right. `mode` is only
 * the voice: social cards speak "watched …", profile cards speak verb-first
 * ("Watched …").
 */
export function ActivityCardCore({
  activity,
  mode,
  coverClassName,
  coverSizes,
  actor,
  review,
  footer,
}: {
  activity: Activity;
  mode: "social" | "profile";
  coverClassName: string;
  coverSizes: string;
  /** Rendered above the lead; links to the actor's Profile. */
  actor?: ReactNode;
  /** Rendered beneath the statement; the profile passes nothing. */
  review?: ReactNode;
  /** Rendered at the bottom of the content column. */
  footer?: ReactNode;
}) {
  const media = activity.media ? normalizeMediaCompact(activity.media) : null;
  // The media row can be missing (deleted or never fetched); the phrase still
  // speaks from the snapshot, using the activity's own media type.
  const mediaType = media?.type ?? activity.mediaType;
  const phrase =
    mediaType && activity.type === "LOG" ? logPhrase(mediaType, activity.snapshot, mode) : null;
  const lead = activity.type === "REVIEW" ? "Reviewed" : (phrase?.lead ?? "Updated");

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
          {lead}{" "}
          {media ? (
            <Link
              href={mediaHref(media.type, media.id)}
              className="font-medium text-inherit hover:text-primary"
            >
              {media.title}
            </Link>
          ) : (
            <span className="font-medium">Unknown Title</span>
          )}
          {phrase?.tail ? ` ${phrase.tail}` : null}
        </p>
        {/* ponytail: metadata row (score star, volumes, progress) hidden for
            now per design call — restore when the details row earns its place
        {phrase && (phrase.details || phrase.score != null) ? (
          <p className="flex flex-wrap items-center gap-x-2 text-sm">
            {phrase.details}
            {phrase.score != null ? (
              <span className="inline-flex items-center gap-1 font-medium text-foreground">
                <Star className="size-4 fill-primary text-primary" aria-hidden />
                {phrase.score}/10
              </span>
            ) : null}
          </p>
        ) : null}
        */}
        {review}
        {footer}
      </div>
    </div>
  );
}

/** The rendered review content a feed card shows inline, in a card inset. */
export function ActivityReviewContent({ html }: { html: string }) {
  return (
    <div className="mt-3 rounded-lg border border-border/50 bg-muted/20 p-3 text-sm text-foreground">
      <SpoilerLayer html={html} className="text-foreground/90" />
    </div>
  );
}
