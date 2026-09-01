"use client";

import { ActivityCard } from "@/features/social/components/activity-card";
import { Button } from "@/shared/components/ui/button";
import { ContentState } from "@/shared/components/content-state";
import { QueryState } from "@/shared/components/query-state";
import { cn } from "@/shared/lib/utils";

import { useProfileActivity } from "../hooks/use-profile-activity";
import { BENTO_CARD } from "./profile-section";

/** The profile's real Activity stream: Logs and Reviews, with a load-more. */
export function ProfileActivityStream({
  className,
  username,
}: {
  className?: string;
  username: string;
}) {
  const query = useProfileActivity(username);
  const activities = query.data?.pages.flatMap((page) => page.activities) ?? [];

  return (
    <section className={cn(BENTO_CARD, "p-5 sm:p-6", className)}>
      <QueryState
        isLoading={query.isLoading}
        isError={query.isError}
        isEmpty={!activities.length}
        errorTitle="Could not load Activity"
        empty={<ContentState title="No recent activity" />}
      >
        <div>
          {activities.map((activity) => (
            <ActivityCard key={activity.id} activity={activity} showActor={false} />
          ))}
          {query.hasNextPage && (
            <Button
              className="mt-6"
              variant="outline"
              disabled={query.isFetchingNextPage}
              onClick={() => void query.fetchNextPage()}
            >
              {query.isFetchingNextPage ? "Loading…" : "Load older Activity"}
            </Button>
          )}
        </div>
      </QueryState>
    </section>
  );
}
