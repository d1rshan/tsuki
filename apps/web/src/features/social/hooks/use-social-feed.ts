"use client";

import { useInfiniteQuery } from "@tanstack/react-query";

import { getSocialFeed, type SocialFeedType } from "../data";
import { socialKeys } from "../query-keys";

export function useSocialFeed(type: SocialFeedType) {
  return useInfiniteQuery({
    queryKey: socialKeys.feed(type),
    queryFn: ({ pageParam }) => getSocialFeed(type, pageParam),
    initialPageParam: null as string | null,
    getNextPageParam: (page) => page.nextCursor,
  });
}
