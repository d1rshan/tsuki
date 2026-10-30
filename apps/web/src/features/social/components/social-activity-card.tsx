"use client";

import Link from "next/link";

import type { Activity } from "@tsuki/api/types";

import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";

import { ActivityCardCore } from "./activity-core";

export function SocialActivityCard({ activity }: { activity: Activity }) {
  return (
    <article className="py-4">
      <ActivityCardCore
        activity={activity}
        coverClassName="w-14"
        coverSizes="56px"
        actor={
          <Link
            href={`/${activity.actor.username}`}
            prefetch={true}
            className="flex min-w-0 items-center gap-2 text-sm font-medium text-foreground hover:underline"
          >
            <Avatar className="size-6">
              {activity.actor.image ? <AvatarImage src={activity.actor.image} alt="" /> : null}
              <AvatarFallback className="bg-muted text-xs">
                {activity.actor.displayUsername[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="truncate">{activity.actor.displayUsername}</span>
          </Link>
        }
      />
    </article>
  );
}
