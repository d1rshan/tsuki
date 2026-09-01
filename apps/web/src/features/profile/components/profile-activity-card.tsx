"use client";

import type { Activity } from "@tsuki/api/types";

import { ActivityCardCore } from "@/features/social/components/activity-core";

/**
 * A Profile Activity row: verb-first phrase ("Watched episodes 13–15 of …")
 * and Reviews reduced to "Reviewed …" — the overview stays a summary, not a
 * duplicate of the reviews page. Only the media title and cover link
 * anywhere; the row itself is not a click target.
 */
export function ProfileActivityCard({ activity }: { activity: Activity }) {
  return (
    <article>
      <ActivityCardCore
        activity={activity}
        mode="profile"
        coverClassName="w-14"
        coverSizes="56px"
      />
    </article>
  );
}
