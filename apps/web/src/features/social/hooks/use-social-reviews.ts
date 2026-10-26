"use client";

import { useInfiniteQuery } from "@tanstack/react-query";

import { getSocialReviews, type SocialFeedType } from "../data";
import { socialKeys } from "../query-keys";

export function useSocialReviews(type: SocialFeedType) {
  return useInfiniteQuery({
    queryKey: socialKeys.reviews(type),
    queryFn: ({ pageParam }) => getSocialReviews(type, pageParam),
    initialPageParam: null as string | null,
    getNextPageParam: (page) => page.nextCursor,
  });
}
