"use client";

import { useQueryClient } from "@tanstack/react-query";

import type { DiscoveryUserSummary } from "@tsuki/api/types";

import { useFollowMutation } from "@/features/social/hooks/use-follow-mutation";

import { socialKeys } from "../query-keys";

export function useDiscoveryFollowMutation() {
  const queryClient = useQueryClient();

  return useFollowMutation(async (relationship, username) => {
    const discoveryQueryKey = [...socialKeys.all, "discovery"] as const;
    await queryClient.cancelQueries({ queryKey: discoveryQueryKey }, { silent: true });
    queryClient.setQueriesData<DiscoveryUserSummary[]>({ queryKey: discoveryQueryKey }, (users) =>
      users?.map((user) => (user.username === username ? { ...user, relationship } : user)),
    );
  });
}
