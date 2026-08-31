"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

import type { Activity } from "@tsuki/api/types";

import { mediaHref, normalizeMediaCompact, statusLabel } from "@/features/media/media";
import { SpoilerLayer } from "@/features/rich-content/components/spoiler-layer";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";

/**
 * The one Activity card, shared by the social feed and profile streams.
 * Cards are self-contained: media, actor, and the state at save time
 * (or the pre-rendered review content).
 */
export function ActivityCard({ activity }: { activity: Activity }) {
  const media = activity.media ? normalizeMediaCompact(activity.media) : null;
  const profileLink = (username: string, displayUsername: string) => (
    <Link href={`/${username}`} className="font-semibold text-foreground hover:text-primary">
      {displayUsername}
    </Link>
  );
  const details =
    media && activity.type === "LOG"
      ? [
          activity.snapshot.status ? statusLabel(media.type, activity.snapshot.status) : null,
          activity.snapshot.progress === undefined
            ? null
            : `${activity.snapshot.progress} ${media.type === "ANIME" ? "episodes" : "chapters"}`,
          activity.snapshot.progressVolumes == null
            ? null
            : `${activity.snapshot.progressVolumes} volumes`,
          activity.snapshot.score ? `${activity.snapshot.score}/10` : null,
          activity.snapshot.repeat ? `×${activity.snapshot.repeat}` : null,
        ]
          .filter(Boolean)
          .join(" · ")
      : null;

  return (
    <article className="flex gap-3 border-b py-5 last:border-0">
      <Link href={`/${activity.actor.username}`}>
        <Avatar>
          {activity.actor.image ? <AvatarImage src={activity.actor.image} alt="" /> : null}
          <AvatarFallback>{activity.actor.displayUsername[0]?.toUpperCase()}</AvatarFallback>
        </Avatar>
      </Link>
      <div className="min-w-0 flex-1 space-y-2">
        <p className="text-sm text-muted-foreground">
          {profileLink(activity.actor.username, activity.actor.displayUsername)}{" "}
          {activity.type === "REVIEW" ? "reviewed" : "logged"}{" "}
          {media ? (
            <Link
              href={mediaHref(media.type, media.id)}
              className="font-semibold text-foreground hover:text-primary"
            >
              {media.title}
            </Link>
          ) : (
            "a title"
          )}
        </p>
        {details ? <p className="text-sm">{details}</p> : null}
        {activity.type === "REVIEW" && activity.snapshot.contentHtml ? (
          <div className="text-sm text-foreground">
            <SpoilerLayer html={activity.snapshot.contentHtml} className="text-foreground/90" />
            <Link
              href={`/${activity.actor.username}/reviews`}
              className="ml-2 text-xs font-medium text-primary hover:underline"
            >
              View review
            </Link>
          </div>
        ) : null}
        <time
          className="block text-xs text-muted-foreground"
          dateTime={activity.occurredAt.toISOString()}
        >
          {formatDistanceToNow(new Date(activity.occurredAt), { addSuffix: true })}
        </time>
      </div>
    </article>
  );
}
