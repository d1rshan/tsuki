"use client";

import { ContentState } from "@/shared/components/content-state";
import { LoadMoreButton } from "@/shared/components/load-more-button";
import { QueryState } from "@/shared/components/query-state";
import { cn } from "@/shared/lib/utils";

import { useProfileActivity } from "../hooks/use-profile-activity";
import { BENTO_CARD } from "./profile-section";
import { ProfileActivityCard } from "./profile-activity-card";

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
        onRetry={() => void query.refetch()}
        empty={<ContentState title="No recent activity" />}
      >
        <div className="grid gap-y-5 gap-x-8 lg:grid-cols-2">
          {activities.map((activity) => (
            <ProfileActivityCard key={activity.id} activity={activity} />
          ))}
          <LoadMoreButton
            className="lg:col-span-2"
            fetching={query.isFetchingNextPage}
            hasNext={Boolean(query.hasNextPage)}
            onLoadMore={() => void query.fetchNextPage()}
          />
        </div>
      </QueryState>
    </section>
  );
}
