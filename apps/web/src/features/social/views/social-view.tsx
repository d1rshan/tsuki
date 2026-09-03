"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, UserX } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import { ContentState } from "@/shared/components/content-state";
import { Input } from "@/shared/components/ui/input";
import { LoadMoreButton } from "@/shared/components/load-more-button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/shared/components/ui/sheet";
import { QueryState } from "@/shared/components/query-state";
import { useDebouncedValue } from "@/shared/hooks/use-debounced-value";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { SocialActivityCard } from "../components/social-activity-card";
import type { SocialFeedType } from "../data";
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
          <ContentState title="No friends :(" />
        ) : (
          <ContentState title="No Activity yet" />
        )
      }
    >
      <div>
        {activities.map((activity) => (
          <SocialActivityCard key={activity.id} activity={activity} />
        ))}
        <LoadMoreButton
          fetching={query.isFetchingNextPage}
          hasNext={Boolean(query.hasNextPage)}
          onLoadMore={() => void query.fetchNextPage()}
        />
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
          placeholder="Search by username"
          aria-label="Search by username"
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
        <ul className="mt-4 grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3">
          {users.map((user) => (
            <li key={user.id}>
              <Link
                href={`/${user.username}`}
                className="flex flex-col items-center gap-2 text-center"
              >
                <Avatar className="size-20">
                  {user.image ? <AvatarImage src={user.image} alt={user.name} /> : null}
                  <AvatarFallback className="text-lg">
                    {user.displayUsername[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="w-full truncate text-sm font-medium">{user.displayUsername}</span>
              </Link>
            </li>
          ))}
        </ul>
      </QueryState>
    </div>
  );
}

export function SocialView({ isAuthenticated }: { isAuthenticated: boolean }) {
  const signInTeaser = (
    <p className="text-sm text-muted-foreground">
      <Link href="/login" className="font-semibold text-primary hover:underline">
        Sign in
      </Link>{" "}
      to see Activity from people you follow.
    </p>
  );

  const findPeopleSheet = (
    <Sheet>
      <SheetTrigger
        render={
          <Button
            variant="outline"
            size="icon-lg"
            className="fixed right-5 bottom-5 z-30 size-14 rounded-full border-black/5 glass shadow-2xl md:hidden dark:border-white/10"
            aria-label="Find People"
          />
        }
      >
        <Search />
      </SheetTrigger>
      <SheetContent
        side="bottom"
        className="max-h-[80dvh] gap-0 overflow-y-auto rounded-t-2xl px-4 pb-8"
      >
        <SheetHeader className="px-0">
          <SheetTitle>Find People</SheetTitle>
        </SheetHeader>
        <Discover />
      </SheetContent>
    </Sheet>
  );

  // CSS-toggled, not JS-toggled: useIsMobile's server snapshot is always false,
  // so a JS branch would flash the desktop layout on every mobile reload.
  const mobileTeaser = !isAuthenticated && <div className="mb-4 md:hidden">{signInTeaser}</div>;

  return (
    <div className="grid gap-6 pt-28 pb-24 md:pt-32 md:pb-16 md:grid-cols-[minmax(0,1fr)_minmax(0,18rem)] lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:gap-8">
      <section aria-label="Activity" className="min-w-0">
        {isAuthenticated ? (
          <Tabs defaultValue="public">
            <div className="mb-2 flex items-center justify-between gap-4">
              <h2 className="text-lg font-semibold">Recent Activity</h2>
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
            <h2 className="mb-4 text-lg font-semibold">Recent Activity</h2>
            {mobileTeaser}
            <Feed type="public" />
          </>
        )}
      </section>
      <aside className="hidden min-w-0 flex-col gap-6 border-t pt-6 md:flex md:border-t-0 md:border-l md:pt-0 md:pl-6 lg:gap-8 lg:pl-8">
        {!isAuthenticated && signInTeaser}
        <section aria-label="Discover people">
          <h2 className="mb-4 text-lg font-semibold">Find People</h2>
          <Discover />
        </section>
      </aside>
      {findPeopleSheet}
    </div>
  );
}
