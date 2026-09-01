"use client";

import Link from "next/link";

import type { Activity } from "@tsuki/api/types";

import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";

import { ActivityCardCore, ActivityReviewContent } from "./activity-core";

/**
 * A feed row: the media cover on the left; a small avatar and the actor's
 * name (both linking to their Profile) in the header; the day's phrase with
 * a Review's full rendered content beneath. No whole-card click and no
 * review navigation — links are the actor and the media only.
 */
export function SocialActivityCard({ activity }: { activity: Activity }) {
  return (
    <article className="border-b py-5 last:border-0">
      <ActivityCardCore
        activity={activity}
        mode="social"
        coverClassName="w-14"
        coverSizes="56px"
        actor={
          <Link
            href={`/${activity.actor.username}`}
            className="mb-1.5 block w-fit text-sm font-semibold text-foreground hover:text-primary"
          >
            {activity.actor.displayUsername}
          </Link>
        }
        footer={
          <Link href={`/${activity.actor.username}`} className="mt-2 block w-fit">
            <Avatar className="size-6">
              {activity.actor.image ? <AvatarImage src={activity.actor.image} alt="" /> : null}
              <AvatarFallback className="text-xs">
                {activity.actor.displayUsername[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Link>
        }
        review={
          activity.type === "REVIEW" && activity.snapshot.contentHtml ? (
            <ActivityReviewContent html={activity.snapshot.contentHtml} />
          ) : undefined
        }
      />
    </article>
  );
}
