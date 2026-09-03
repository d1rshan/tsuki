"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, UserX } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import { ContentState } from "@/shared/components/content-state";
import { Input } from "@/shared/components/ui/input";
import { QueryState } from "@/shared/components/query-state";
import { useDebouncedValue } from "@/shared/hooks/use-debounced-value";
import { cn } from "@/shared/lib/utils";

import { ActivityCard } from "../components/activity-card";
import type { SocialFeedType } from "../data";
import { useSocialDiscovery } from "../hooks/use-social-discovery";
import { useSocialFeed } from "../hooks/use-social-feed";

const columnScroll = "min-w-0 lg:max-h-[calc(100dvh-10rem)] lg:overflow-y-auto lg:pr-1";

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
          <ContentState title="No friends :(" description="Follow people from Discover above." />
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
          className="h-10 rounded-md pl-9"
        />
      </div>
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
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {users.map((user) => (
            <li key={user.id}>
              <Link
                href={`/${user.username}`}
                className="flex flex-col items-center gap-2 rounded-xl border bg-card/50 p-4 text-center shadow-sm"
              >
                <Avatar className="size-20">
                  {user.image ? <AvatarImage src={user.image} alt={user.name} /> : null}
                  <AvatarFallback className="text-lg">
                    {user.displayUsername[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="w-full truncate font-semibold">{user.displayUsername}</span>
                <span className="text-xs text-muted-foreground">
                  {user.followersCount} follower{user.followersCount === 1 ? "" : "s"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </QueryState>
    </div>
  );
}

export function SocialView({ isAuthenticated }: { isAuthenticated: boolean }) {
  return (
    <div className="grid gap-8 pt-28 pb-16 md:pt-32 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)]">
      <section aria-label="Public Activity" className={columnScroll}>
        <Feed type="public" />
      </section>
      <aside className={cn(columnScroll, "flex flex-col gap-8")}>
        {!isAuthenticated && (
          <p className="text-sm text-muted-foreground">
            <Link href="/login" className="font-semibold text-primary hover:underline">
              Sign in
            </Link>{" "}
            to see Activity from people you follow.
          </p>
        )}
        <section aria-label="Discover people">
          <h2 className="mb-4 text-lg font-semibold">Discover</h2>
          <Discover />
        </section>
        {isAuthenticated && (
          <section aria-label="Following Activity">
            <h2 className="mb-4 text-lg font-semibold">Following</h2>
            <Feed type="following" />
          </section>
        )}
      </aside>
    </div>
  );
}
