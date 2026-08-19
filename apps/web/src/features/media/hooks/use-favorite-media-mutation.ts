"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type { MediaType } from "@tsuki/api/types";

import { logMediaAction } from "../actions";
import { mediaKeys } from "../query-keys";

export function useFavoriteMediaMutation(mediaType: MediaType, mediaId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["media", "favorite", mediaType, mediaId],
    mutationFn: (nextIsFavorite: boolean) =>
      logMediaAction(mediaType, mediaId, { isFavorite: nextIsFavorite }),
    onSuccess: async (_, nextIsFavorite) => {
      await queryClient.invalidateQueries({ queryKey: mediaKeys.activity(mediaType, mediaId) });
      toast.success(nextIsFavorite ? "Added to favorites" : "Removed from favorites");
    },
    onError: () => toast.error("Failed to update favorite"),
  });
}
