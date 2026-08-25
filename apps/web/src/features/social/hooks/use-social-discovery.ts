"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { getSocialDiscovery } from "../data";
import { socialKeys } from "../query-keys";

export function useSocialDiscovery(username: string) {
  return useQuery({
    queryKey: socialKeys.discovery(username),
    queryFn: () => getSocialDiscovery(username),
    placeholderData: keepPreviousData,
  });
}
