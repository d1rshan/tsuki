"use client";

import { useState } from "react";
import Link from "next/link";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { toast } from "sonner";

import type { DiscoveryUserSummary } from "@tsuki/api/types";

import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import { ErrorState, EmptyState } from "@/shared/components/content-state";
import { Loader } from "@/shared/components/loader";
import { Input } from "@/shared/components/ui/input";
import { useDebouncedValue } from "@/shared/hooks/use-debounced-value";
import { apiClient } from "@/shared/lib/api-client";
import { setFollowingAction } from "@/features/profile/actions";
import { followButtonLabel } from "@/features/profile/follow";

import { friendsKeys } from "../query-keys";

async function getDiscovery(username: string) {
  const { data, error } = await apiClient.users.discover.get({
    query: username ? { username } : {},
  });
  if (error || !data) throw error ?? new Error("Failed to load Friends");

  return data.users;
}

export function FriendsView() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search.trim(), 250);
  const queryClient = useQueryClient();
  const discoveryQuery = useQuery({
    queryKey: friendsKeys.discovery(debouncedSearch),
    queryFn: () => getDiscovery(debouncedSearch),
    placeholderData: keepPreviousData,
  });
  const followMutation = useMutation({
    mutationFn: ({ username, following }: { username: string; following: boolean }) =>
      setFollowingAction(username, following),
    onSuccess: async (relationship, { username }) => {
      await queryClient.cancelQueries({ queryKey: friendsKeys.all }, { silent: true });
      queryClient.setQueriesData<DiscoveryUserSummary[]>({ queryKey: friendsKeys.all }, (users) =>
        users?.map((user) => (user.username === username ? { ...user, relationship } : user)),
      );
    },
    onError: () => toast.error("Failed to update follow"),
  });
  const isSearching = search.trim() !== debouncedSearch || discoveryQuery.isFetching;
  const users = discoveryQuery.data ?? [];

  return (
    <div className="container mx-auto max-w-6xl px-4 pt-28 pb-16 md:pt-32">
      <header className="max-w-2xl space-y-3">
        <h1 className="text-4xl font-black tracking-tight sm:text-5xl">Friends</h1>
      </header>

      <div className="relative mt-10 max-w-xl">
        <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by Username"
          aria-label="Search by Username"
          className="h-12 rounded-xl pl-11"
        />
      </div>

      <section className="mt-10" aria-busy={isSearching}>
        <div className="mb-5 flex items-baseline justify-between gap-4">
          <h2 className="text-2xl font-bold tracking-tight">
            {debouncedSearch ? "Username Search" : "Popular on Tsuki"}
          </h2>
          {isSearching ? <span className="text-sm text-muted-foreground">Searching…</span> : null}
        </div>

        {discoveryQuery.isLoading ? (
          <Loader />
        ) : discoveryQuery.isError ? (
          <div className="space-y-3">
            <ErrorState title="Could not load people" description="Try again in a moment." />
            <div className="text-center">
              <Button variant="outline" onClick={() => void discoveryQuery.refetch()}>
                Retry
              </Button>
            </div>
          </div>
        ) : users.length === 0 && !isSearching ? (
          <EmptyState
            title={
              debouncedSearch ? `No Profiles match “${debouncedSearch}”` : "No people to show yet"
            }
            description={debouncedSearch ? "Try a different Username prefix." : undefined}
          />
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" aria-label="People">
            {users.map((user) => (
              <li key={user.id} className="rounded-xl border p-4">
                <div className="flex items-center gap-3">
                  <Link
                    href={`/${user.username}`}
                    className="flex min-w-0 flex-1 items-center gap-3"
                  >
                    <Avatar size="lg">
                      {user.image ? <AvatarImage src={user.image} alt={user.name} /> : null}
                      <AvatarFallback>
                        {user.displayUsername.charAt(0).toUpperCase()}
                      </AvatarFallback>
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
                    disabled={followMutation.isPending}
                    onClick={() =>
                      followMutation.mutate({
                        username: user.username,
                        following: !user.relationship.following,
                      })
                    }
                  >
                    {followButtonLabel(user.relationship)}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
