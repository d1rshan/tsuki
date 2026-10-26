"use client";

import { UserX } from "lucide-react";

import { ContentState } from "@/shared/components/content-state";
import { LoadMoreButton } from "@/shared/components/load-more-button";
import { QueryState } from "@/shared/components/query-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { useDebouncedValue } from "@/shared/hooks/use-debounced-value";

import { SocialActivityCard } from "../components/social-activity-card";
import { ProfileCard } from "../components/profile-card";
import type { SocialFeedType } from "../data";
import { usePeopleSearch } from "../hooks/use-people-search";
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
  const isSearching = search || Boolean(q);

  return (
    <div className="pt-28 pb-24 md:pt-32 md:pb-16">
      {isSearching ? (
        <section aria-label="Find People">
          <h2 className="mb-4 text-lg font-semibold">Find People</h2>
          <Discover search={q} />
        </section>
      ) : (
        <section aria-label="Activity" className="min-w-0">
          {isAuthenticated ? (
            <Tabs defaultValue="public">
              <div className="mb-2 flex items-center justify-between gap-4">
                <h2 className="text-lg font-semibold">Recent activity</h2>
                <TabsList>
                  <TabsTrigger value="public">Public</TabsTrigger>
                  <TabsTrigger value="following">Following</TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value="public">
                <Feed type="public" />
              </TabsContent>
              <TabsContent value="following">
                <Feed type="following" />
              </TabsContent>
            </Tabs>
          ) : (
            <>
              <h2 className="mb-4 text-lg font-semibold">Recent activity</h2>
              <Feed type="public" />
            </>
          )}
        </section>
      )}
    </div>
  );
}
