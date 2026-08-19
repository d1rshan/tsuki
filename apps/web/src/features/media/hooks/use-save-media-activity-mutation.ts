"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type { Review, MediaType } from "@tsuki/api/types";

import { deleteReviewAction, logMediaAction, submitReviewAction } from "../actions";
import { createLogMediaInput, saveMediaActivity, type ActivityForm } from "../activity";
import { MEDIA } from "../media";
import { mediaKeys } from "../query-keys";

export function useSaveMediaActivityMutation(mediaType: MediaType, mediaId: number) {
  const queryClient = useQueryClient();
  const config = MEDIA[mediaType];

  return useMutation({
    mutationKey: ["media", "activity", mediaType, mediaId],
    mutationFn: ({ form, isFavorite, review, total }: SaveMediaActivityVariables) =>
      saveMediaActivity(
        () => logMediaAction(mediaType, mediaId, createLogMediaInput(form, isFavorite, total)),
        async () => {
          const reviewContent = form.reviewContent.trim();
          if (reviewContent) {
            await submitReviewAction(mediaType, mediaId, reviewContent, form.containsSpoilers);
          } else if (review) {
            await deleteReviewAction(mediaType, mediaId);
          }
        },
      ),
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: mediaKeys.activity(mediaType, mediaId) });

      if (result === "review-failed") {
        toast.error("Log saved, but the review failed. Try saving again.");
        return;
      }

      toast.success(`${config.label} log saved`);
    },
    onError: () => toast.error(`Failed to save ${config.label.toLowerCase()} log`),
  });
}

type SaveMediaActivityVariables = {
  form: ActivityForm;
  isFavorite: boolean;
  review: Review | null;
  total?: number | null;
};
