"use client";

import type { Activity } from "@tsuki/api/types";

import { ActivityCardCore } from "@/features/social/components/activity-core";

export function ProfileActivityCard({ activity }: { activity: Activity }) {
  return (
    <article>
      <ActivityCardCore activity={activity} coverClassName="w-14" coverSizes="56px" />
    </article>
  );
}
