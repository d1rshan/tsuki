"use client";

import { useRef, useState } from "react";
import { Search, UserX } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { ContentState } from "@/shared/components/content-state";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/shared/components/ui/input-group";
import { Kbd } from "@/shared/components/ui/kbd";
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
import { useHotkey } from "@/shared/hooks/use-hotkey";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { SocialActivityCard } from "../components/social-activity-card";
import { ProfileCard } from "../components/profile-card";
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
        <div className="pb-10">
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

function Discover() {
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  useHotkey("/", () => inputRef.current?.focus());
  const username = useDebouncedValue(search.trim(), 250);
  const query = useSocialDiscovery(username);
  const users = query.data ?? [];

  return (
    <div>
      <InputGroup>
        <InputGroupAddon>
          <Search className="size-4" />
        </InputGroupAddon>
        <InputGroupInput
          ref={inputRef}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search username"
          aria-label="Search by username"
          className="h-full text-base"
        />
        <InputGroupAddon align="inline-end">
          <Kbd>/</Kbd>
        </InputGroupAddon>
      </InputGroup>
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
        <ul className="mt-4 grid grid-cols-2 gap-x-3 gap-y-6 @min-[40rem]:grid-cols-3 @min-[48rem]:grid-cols-2 @min-[64rem]:grid-cols-3">
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

  return (
    <div className="grid gap-6 pt-28 pb-24 @min-[48rem]:grid-cols-[minmax(0,1fr)_minmax(0,18rem)] @min-[64rem]:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] @min-[64rem]:gap-8 md:pt-32 md:pb-16">
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
            <Feed type="public" />
          </>
        )}
      </section>
      <aside className="hidden min-w-0 flex-col gap-6 border-t pt-6 @min-[48rem]:flex @min-[48rem]:border-t-0 @min-[48rem]:border-l @min-[48rem]:pt-0 @min-[48rem]:pl-6 @min-[64rem]:gap-8 @min-[64rem]:pl-8">
        <section aria-label="Discover people">
          <h2 className="mb-4 text-lg font-semibold">Find People</h2>
          <Discover />
        </section>
      </aside>
      {findPeopleSheet}
    </div>
  );
}
