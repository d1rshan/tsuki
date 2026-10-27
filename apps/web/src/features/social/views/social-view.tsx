"use client";

import { UserX } from "lucide-react";

import { ContentState } from "@/shared/components/content-state";
import { LoadMoreButton } from "@/shared/components/load-more-button";
import { QueryState } from "@/shared/components/query-state";
import { useDebouncedValue } from "@/shared/hooks/use-debounced-value";

import { SocialReviews } from "../components/social-reviews";
import { SocialFeedSwitcher } from "../components/social-feed-switcher";
import { SocialActivityCard } from "../components/social-activity-card";
import { ProfileCard } from "../components/profile-card";
import type { SocialFeedType } from "../data";
import { usePeopleSearch } from "../hooks/use-people-search";
import { useSocialFeedMode } from "../hooks/use-social-feed-mode";
import { useSocialDiscovery } from "../hooks/use-social-discovery";
import { useSocialFeed } from "../hooks/use-social-feed";

function Feed({ type }: { type: SocialFeedType }) {
  const query = useSocialFeed(type);
  const activities = query.data?.pages.flatMap((page) => page.activities) ?? [];

  return (
    <QueryState
      isLoading={query.isLoading}
      isError={query.isError}
      isEmpty={!activities.length}
      errorTitle="Could not load Activity"
      onRetry={() => void query.refetch()}
      empty={
        type === "following" ? (
          <ContentState title="No friends :(" />
        ) : (
          <ContentState title="No Activity yet" />
        )
      }
    >
      <div className="relative">
        <div className="space-y-4 pb-10">
          {activities.map((activity) => (
            <SocialActivityCard key={activity.id} activity={activity} />
          ))}
        </div>
        <LoadMoreButton
          className="absolute bottom-2 left-1/2 -translate-x-1/2"
          fetching={query.isFetchingNextPage}
          hasNext={Boolean(query.hasNextPage)}
          onLoadMore={() => void query.fetchNextPage()}
        />
      </div>
    </QueryState>
  );
}

function SocialFeeds({
  type,
  showSwitcher = true,
}: {
  type: SocialFeedType;
  showSwitcher?: boolean;
}) {
  return (
    <div className="grid gap-8 @min-[48rem]:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
      <section aria-label="Activity" className="min-w-0">
        <div className="mb-2 flex items-center justify-between gap-4">
          <h2 className="text-base font-medium">Activity</h2>
          {showSwitcher && <SocialFeedSwitcher />}
        </div>
        <Feed type={type} />
      </section>
      <aside aria-label="Recent reviews" className="@container/reviews min-w-0">
        <h2 className="mb-4 text-base font-medium">Recent reviews</h2>
        <SocialReviews type="public" />
      </aside>
    </div>
  );
}

function Discover({ search }: { search: string }) {
  const username = useDebouncedValue(search.trim(), 250);
  const query = useSocialDiscovery(username);
  const users = query.data ?? [];

  return (
    <div>
      <QueryState
        isLoading={query.isLoading}
        isError={query.isError}
        isEmpty={!users.length}
        errorTitle="Could not load people"
        onRetry={() => void query.refetch()}
        empty={
          <ContentState
            icon={UserX}
            title={username ? `No Profiles match “${username}”` : "No people to show yet"}
          />
        }
      >
        <ul className="mt-4 grid grid-cols-2 gap-x-3 gap-y-6 @min-[40rem]:grid-cols-3 @min-[64rem]:grid-cols-4">
          {users.map((user) => (
            <li key={user.id}>
              <ProfileCard user={user} />
            </li>
          ))}
        </ul>
      </QueryState>
    </div>
  );
}

export function SocialView({ isAuthenticated }: { isAuthenticated: boolean }) {
  const [{ search, q }] = usePeopleSearch();
  const [feedMode] = useSocialFeedMode();
  const isSearching = search || Boolean(q);

  return (
    <div className="pt-28 pb-24 md:pt-32 md:pb-16">
      {isSearching ? (
        <section aria-label="Find people">
          <h2 className="mb-4 text-base font-medium">Find people</h2>
          <Discover search={q} />
        </section>
      ) : (
        <div className="min-w-0">
          {isAuthenticated ? (
            <SocialFeeds type={feedMode} />
          ) : (
            <SocialFeeds type="public" showSwitcher={false} />
          )}
        </div>
      )}
    </div>
  );
}
