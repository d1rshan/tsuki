"use client";

import { useQuery } from "@tanstack/react-query";

import { useSession } from "@tsuki/auth/client";
import type { MediaType } from "@tsuki/api/types";

import { apiClient } from "@/shared/lib/api-client";

import { mediaKeys } from "../query-keys";

async function getMediaActivity(mediaType: MediaType, mediaId: number) {
  const { data, error } = await apiClient.me.library({ type: mediaType })({ id: mediaId }).get();
  if (error) throw error;

  return data;
}

export function useMediaActivity(mediaType: MediaType, mediaId: number) {
  const { data: session, isPending: isSessionPending } = useSession();
  const isAuthenticated = Boolean(session?.user);
  const query = useQuery({
    queryKey: mediaKeys.activity(mediaType, mediaId),
    queryFn: () => getMediaActivity(mediaType, mediaId),
    enabled: isAuthenticated,
  });

  return {
    entry: query.data?.entry ?? null,
    isAuthenticated,
    isError: query.isError,
    isPending: isSessionPending || (isAuthenticated && query.isFetching),
    retry: query.refetch,
    review: query.data?.review ?? null,
  };
}

export type MediaActivity = ReturnType<typeof useMediaActivity>;
