"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { getFriendsDiscovery } from "../data";
import { friendsKeys } from "../query-keys";

export function useFriendsDiscovery(username: string) {
  return useQuery({
    queryKey: friendsKeys.discovery(username),
    queryFn: () => getFriendsDiscovery(username),
    placeholderData: keepPreviousData,
  });
}
