"use client";

import Link from "next/link";

import type { Activity } from "@tsuki/api/types";

import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";

import { ActivityCardCore } from "./activity-core";

export function SocialActivityCard({ activity }: { activity: Activity }) {
  return (
    <article className="rounded-xl bg-muted p-4">
      <ActivityCardCore
        activity={activity}
        coverClassName="w-14"
        coverSizes="56px"
        actor={
          <Link
            href={`/${activity.actor.username}`}
            className="block w-fit text-sm font-medium text-foreground"
          >
            {activity.actor.displayUsername}
          </Link>
        }
        footer={
          <Link href={`/${activity.actor.username}`} className="mt-2 block w-fit">
            <Avatar className="size-6">
              {activity.actor.image ? <AvatarImage src={activity.actor.image} alt="" /> : null}
              <AvatarFallback className="bg-card text-xs">
                {activity.actor.displayUsername[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Link>
        }
      />
    </article>
  );
}
