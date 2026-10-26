"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type { MediaType } from "@tsuki/api/types";

import { socialKeys } from "@/features/social/query-keys";

import { logMediaAction, removeMediaAction } from "../actions";
import { mediaKeys } from "../query-keys";

export function useWatchlistMediaMutation(mediaType: MediaType, mediaId: number) {
  const queryClient = useQueryClient();
  const listLabel = mediaType === "ANIME" ? "watchlist" : "read list";

  return useMutation({
    mutationKey: ["media", "watchlist", mediaType, mediaId],
    mutationFn: (nextIsListed: boolean) =>
      nextIsListed
        ? logMediaAction(mediaType, mediaId, { status: "PLANNING" })
        : removeMediaAction(mediaType, mediaId),
    onSuccess: async (_, nextIsListed) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: mediaKeys.activity(mediaType, mediaId) }),
        queryClient.invalidateQueries({ queryKey: socialKeys.all }),
      ]);
      toast.success(nextIsListed ? `Added to ${listLabel}` : `Removed from ${listLabel}`);
    },
    onError: () => toast.error(`Failed to update ${listLabel}`),
  });
}
