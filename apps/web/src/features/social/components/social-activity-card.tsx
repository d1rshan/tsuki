"use client";

import Link from "next/link";

import type { Activity } from "@tsuki/api/types";

import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";

import { ActivityCardCore, ActivityReviewContent } from "./activity-core";

/**
 * A feed row: the actor's avatar and name (both linking to their Profile),
 * a small cover thumb, the day's phrase, and a Review's full rendered
 * content. No whole-card click and no review navigation — links are the
 * actor and the media only.
 */
export function SocialActivityCard({ activity }: { activity: Activity }) {
  return (
    <article className="flex gap-3 border-b py-5 last:border-0">
      <Link href={`/${activity.actor.username}`}>
        <Avatar>
          {activity.actor.image ? <AvatarImage src={activity.actor.image} alt="" /> : null}
          <AvatarFallback>{activity.actor.displayUsername[0]?.toUpperCase()}</AvatarFallback>
        </Avatar>
      </Link>
      <ActivityCardCore
        activity={activity}
        mode="social"
        coverClassName="w-14"
        coverSizes="56px"
        actor={
          <Link
            href={`/${activity.actor.username}`}
            className="font-semibold text-foreground hover:text-primary"
          >
            {activity.actor.displayUsername}{" "}
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
