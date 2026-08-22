"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import type { FollowRelationship } from "@tsuki/api/types";

import { setFollowing } from "../actions";

export function useFollowMutation(
  onSuccess: (relationship: FollowRelationship, username: string) => void | Promise<void>,
) {
  return useMutation({
    mutationFn: ({ username, following }: { username: string; following: boolean }) =>
      setFollowing(username, following),
    onSuccess: async (result, { username }) => {
      if (!result.success) {
        toast.error(result.error);
        return;
      }

      await onSuccess(result.relationship, username);
    },
    onError: () => toast.error("Failed to update follow."),
  });
}
