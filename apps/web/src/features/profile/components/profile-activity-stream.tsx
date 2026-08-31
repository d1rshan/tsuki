"use client";

import Link from "next/link";

import { ActivityCard } from "@/features/social/components/activity-card";
import { Button } from "@/shared/components/ui/button";
import { ContentState } from "@/shared/components/content-state";
import { QueryState } from "@/shared/components/query-state";

import { useProfileActivity } from "../hooks/use-profile-activity";

/** The profile's real Activity stream: Logs and Reviews, with a load-more. */
export function ProfileActivityStream({ title, username }: { title: string; username: string }) {
  const query = useProfileActivity(username);
  const activities = query.data?.pages.flatMap((page) => page.activities) ?? [];

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        <Link
          href={`/${username}/library`}
          className="group flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
        >
          View Library
          <span className="transition-transform group-hover:translate-x-1">&rarr;</span>
        </Link>
      </div>

      <QueryState
        isLoading={query.isLoading}
        isError={query.isError}
        isEmpty={!activities.length}
        errorTitle="Could not load Activity"
        empty={<ContentState title="No recent activity" />}
      >
        <div>
          {activities.map((activity) => (
            <ActivityCard key={activity.id} activity={activity} />
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
