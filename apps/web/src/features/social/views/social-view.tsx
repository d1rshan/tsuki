"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Search, UserX } from "lucide-react";

import { followButtonLabel } from "@/features/social/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { ContentState } from "@/shared/components/content-state";
import { Input } from "@/shared/components/ui/input";
import { QueryState } from "@/shared/components/query-state";
import { useDebouncedValue } from "@/shared/hooks/use-debounced-value";

import { ActivityCard } from "../components/activity-card";
import type { SocialFeedType } from "../data";
import { useDiscoveryFollowMutation } from "../hooks/use-discovery-follow-mutation";
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
      empty={
        type === "following" ? (
          <div className="flex min-h-64 flex-col items-center justify-center text-center">
            <ContentState title="No Friends :(" />
          </div>
        ) : (
          <ContentState title="No Activity yet" />
        )
      }
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
  );
}

function Discover() {
  const [search, setSearch] = useState("");
  const username = useDebouncedValue(search.trim(), 250);
  const query = useSocialDiscovery(username);
  const follow = useDiscoveryFollowMutation();
  const users = query.data ?? [];

  return (
    <div>
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search people by username"
          aria-label="Search people by username"
          autoFocus
          className="h-10 rounded-md pl-9"
        />
      </div>
      <section className="mt-6">
        <QueryState
          isLoading={query.isLoading}
          isError={query.isError}
          isEmpty={!users.length}
          errorTitle="Could not load people"
          empty={
            <ContentState
              icon={UserX}
              title={username ? `No Profiles match “${username}”` : "No people to show yet"}
            />
          }
        >
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {users.map((user) => (
              <li
                key={user.id}
                className="flex min-w-0 items-center gap-3 rounded-xl border bg-card/50 p-4 shadow-sm"
              >
                <Link href={`/${user.username}`} className="flex min-w-0 flex-1 items-center gap-3">
                  <Avatar>
                    {user.image ? <AvatarImage src={user.image} alt={user.name} /> : null}
                    <AvatarFallback>{user.displayUsername[0]?.toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span className="min-w-0">
                    <span className="block truncate font-semibold">{user.displayUsername}</span>
                    <span className="block truncate text-sm text-muted-foreground">
                      @{user.username}
                    </span>
                  </span>
                </Link>
                <Button
                  size="sm"
                  variant={user.relationship.following ? "secondary" : "default"}
                  disabled={follow.isPending}
                  onClick={() =>
                    follow.mutate({
                      username: user.username,
                      following: !user.relationship.following,
                    })
                  }
                >
                  {followButtonLabel(user.relationship)}
                </Button>
              </li>
            ))}
          </ul>
        </QueryState>
      </section>
    </div>
  );
}

export function SocialView() {
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [activeFeed, setActiveFeed] = useState<SocialFeedType>("public");

  return (
    <div className="pt-28 pb-16 md:pt-32">
      {isDiscovering ? (
        <section>
          <Button
            variant="ghost"
            size="sm"
            className="-ml-2 mb-6"
            onClick={() => setIsDiscovering(false)}
          >
            <ArrowLeft />
            Back
          </Button>
          <Discover />
        </section>
      ) : (
        <section className="min-w-0">
          <Tabs
            value={activeFeed}
            onValueChange={(value) => {
              if (value === "public" || value === "following") setActiveFeed(value);
            }}
          >
            <div className="flex items-center justify-between gap-4">
              <TabsList>
                <TabsTrigger value="public">Public</TabsTrigger>
                <TabsTrigger value="following">Following</TabsTrigger>
              </TabsList>
              <Button
                variant="outline"
                size="icon-lg"
                className="size-10 shrink-0 rounded-full"
                onClick={() => setIsDiscovering(true)}
                aria-label="Find people"
              >
                <Search />
              </Button>
            </div>
            <TabsContent value="public">
              <Feed type="public" />
            </TabsContent>
            <TabsContent value="following">
              <Feed type="following" />
            </TabsContent>
          </Tabs>
        </section>
      )}
    </div>
  );
}
