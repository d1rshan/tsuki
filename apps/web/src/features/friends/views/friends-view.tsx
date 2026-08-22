"use client";

import { useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Search } from "lucide-react";

import type { FeedActivity } from "@tsuki/api/types";

import { followButtonLabel } from "@/features/social/utils";
import { mediaHref, normalizeMediaCompact, statusLabel } from "@/features/media/media";
import { Spoiler } from "@/shared/components/spoiler";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { ErrorState, EmptyState } from "@/shared/components/content-state";
import { Input } from "@/shared/components/ui/input";
import { Loader } from "@/shared/components/loader";
import { useDebouncedValue } from "@/shared/hooks/use-debounced-value";

import type { FriendsFeedType } from "../data";
import { useDiscoveryFollowMutation } from "../hooks/use-discovery-follow-mutation";
import { useFriendsDiscovery } from "../hooks/use-friends-discovery";
import { useFriendsFeed } from "../hooks/use-friends-feed";

function ActivityCard({ activity }: { activity: FeedActivity }) {
  const media = activity.media ? normalizeMediaCompact(activity.media) : null;
  const actor = (
    <Link
      href={`/${activity.actor.username}`}
      className="font-semibold text-foreground hover:text-primary"
    >
      {activity.actor.displayUsername}
    </Link>
  );
  const details =
    media && activity.type === "LOG"
      ? [
          activity.snapshot.status ? statusLabel(media.type, activity.snapshot.status) : null,
          activity.snapshot.progress === undefined
            ? null
            : `${activity.snapshot.progress} ${media.type === "ANIME" ? "episodes" : "chapters"}`,
          activity.snapshot.progressVolumes === undefined ||
          activity.snapshot.progressVolumes === null
            ? null
            : `${activity.snapshot.progressVolumes} volumes`,
          activity.snapshot.score ? `${activity.snapshot.score}/10` : null,
          activity.snapshot.repeat ? `×${activity.snapshot.repeat}` : null,
        ]
          .filter(Boolean)
          .join(" · ")
      : null;

  return (
    <article className="flex gap-3 border-b py-5 last:border-0">
      <Link href={`/${activity.actor.username}`}>
        <Avatar>
          {activity.actor.image ? <AvatarImage src={activity.actor.image} alt="" /> : null}
          <AvatarFallback>{activity.actor.displayUsername[0]?.toUpperCase()}</AvatarFallback>
        </Avatar>
      </Link>
      <div className="min-w-0 flex-1 space-y-2">
        <p className="text-sm text-muted-foreground">
          {activity.type === "FOLLOW" ? (
            <>
              {actor} followed{" "}
              {activity.target ? (
                <Link
                  href={`/${activity.target.username}`}
                  className="font-semibold text-foreground hover:text-primary"
                >
                  {activity.target.displayUsername}
                </Link>
              ) : (
                "a Profile"
              )}
            </>
          ) : (
            <>
              {actor} {activity.type === "REVIEW" ? "reviewed" : "logged"}{" "}
              {media ? (
                <Link
                  href={mediaHref(media.type, media.id)}
                  className="font-semibold text-foreground hover:text-primary"
                >
                  {media.title}
                </Link>
              ) : (
                "a title"
              )}
            </>
          )}
        </p>
        {details ? <p className="text-sm">{details}</p> : null}
        {activity.type === "REVIEW" ? (
          <div className="whitespace-pre-wrap text-sm text-foreground">
            {activity.snapshot.containsSpoilers ? (
              <Spoiler>{activity.snapshot.content ?? ""}</Spoiler>
            ) : (
              activity.snapshot.content
            )}
            <Link
              href={`/${activity.actor.username}/reviews`}
              className="ml-2 text-xs font-medium text-primary hover:underline"
            >
              View review
            </Link>
          </div>
        ) : null}
        <time
          className="block text-xs text-muted-foreground"
          dateTime={activity.occurredAt.toISOString()}
        >
          {formatDistanceToNow(new Date(activity.occurredAt), { addSuffix: true })}
        </time>
      </div>
    </article>
  );
}

function Feed({ type }: { type: FriendsFeedType }) {
  const query = useFriendsFeed(type);
  const activities = query.data?.pages.flatMap((page) => page.activities) ?? [];

  function renderFeed() {
    if (query.isLoading) return <Loader />;
    if (query.isError)
      return <ErrorState title="Could not load Activity" description="Try again in a moment." />;
    if (!activities.length)
      return (
        <EmptyState
          title={
            type === "following" ? "No Activity from people you Follow yet" : "No Activity yet"
          }
        />
      );

    return (
      <div>
        {activities.map((activity) => (
          <ActivityCard key={activity.id} activity={activity} />
        ))}
        {query.hasNextPage ? (
          <Button
            className="mt-6"
            variant="outline"
            disabled={query.isFetchingNextPage}
            onClick={() => void query.fetchNextPage()}
          >
            {query.isFetchingNextPage ? "Loading…" : "Load older Activity"}
          </Button>
        ) : null}
      </div>
    );
  }

  return renderFeed();
}

function Discover() {
  const [search, setSearch] = useState("");
  const username = useDebouncedValue(search.trim(), 250);
  const query = useFriendsDiscovery(username);
  const follow = useDiscoveryFollowMutation();
  const users = query.data ?? [];

  function renderResults() {
    if (query.isLoading) return <Loader />;
    if (query.isError)
      return <ErrorState title="Could not load people" description="Try again in a moment." />;
    if (!users.length)
      return (
        <EmptyState
          title={username ? `No Profiles match “${username}”` : "No people to show yet"}
        />
      );

    return (
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {users.map((user) => (
          <li key={user.id} className="flex items-center gap-3 rounded-xl border p-4">
            <Link href={`/${user.username}`} className="flex min-w-0 flex-1 items-center gap-3">
              <Avatar size="lg">
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
                follow.mutate({ username: user.username, following: !user.relationship.following })
              }
            >
              {followButtonLabel(user.relationship)}
            </Button>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <>
      <div className="relative max-w-xl">
        <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by Username"
          aria-label="Search by Username"
          className="h-12 rounded-xl pl-11"
        />
      </div>
      <section className="mt-8">
        <h2 className="mb-5 text-2xl font-bold tracking-tight">
          {username ? "Username Search" : "Popular on Tsuki"}
        </h2>
        {renderResults()}
      </section>
    </>
  );
}

export function FriendsView() {
  return (
    <div className="container mx-auto max-w-5xl px-4 pt-28 pb-16 md:pt-32">
      <h1 className="text-4xl font-black tracking-tight sm:text-5xl">Friends</h1>
      <Tabs defaultValue="following" className="mt-8">
        <TabsList>
          <TabsTrigger value="following">Following</TabsTrigger>
          <TabsTrigger value="public">Public</TabsTrigger>
          <TabsTrigger value="discover">Discover</TabsTrigger>
        </TabsList>
        <TabsContent value="following">
          <Feed type="following" />
        </TabsContent>
        <TabsContent value="public">
          <Feed type="public" />
        </TabsContent>
        <TabsContent value="discover">
          <Discover />
        </TabsContent>
      </Tabs>
    </div>
  );
}
