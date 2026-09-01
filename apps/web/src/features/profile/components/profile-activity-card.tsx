"use client";

import type { Activity } from "@tsuki/api/types";

import { cn } from "@/shared/lib/utils";

import { ActivityCardCore } from "@/features/social/components/activity-core";
import { BENTO_CARD } from "./profile-section";

/**
 * A Profile bento tile: verb-first phrase ("Watched episodes 13–15 of …"),
 * a larger cover, and Reviews reduced to "Reviewed …" — the overview stays
 * a summary, not a duplicate of the reviews page. Only the media title and
 * cover link anywhere; the tile itself is not a click target.
 */
export function ProfileActivityCard({ activity }: { activity: Activity }) {
  return (
    <article className={cn(BENTO_CARD, "p-4")}>
      <ActivityCardCore
        activity={activity}
        mode="profile"
        coverClassName="w-20"
        coverSizes="80px"
      />
    </article>
  );
}
