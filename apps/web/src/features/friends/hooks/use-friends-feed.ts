"use client";

import { useInfiniteQuery } from "@tanstack/react-query";

import { getFriendsFeed, type FriendsFeedType } from "../data";
import { friendsKeys } from "../query-keys";

export function useFriendsFeed(type: FriendsFeedType) {
  return useInfiniteQuery({
    queryKey: friendsKeys.feed(type),
    queryFn: ({ pageParam }) => getFriendsFeed(type, pageParam),
    initialPageParam: null as string | null,
    getNextPageParam: (page) => page.nextCursor,
  });
}
