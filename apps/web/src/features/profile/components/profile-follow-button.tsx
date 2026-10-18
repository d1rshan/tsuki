"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

import type { FollowRelationship } from "@tsuki/api/types";

import { useFollowMutation } from "@/features/social/hooks/use-follow-mutation";
import { followButtonLabel } from "@/features/social/utils";
import { socialKeys } from "@/features/social/query-keys";
import { Button } from "@/shared/components/ui/button";

export function ProfileFollowButton({
  initialRelationship,
  username,
  isPrivate,
}: {
  initialRelationship: FollowRelationship | null;
  username: string;
  isPrivate: boolean;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [relationship, setRelationship] = useState(initialRelationship);
  const mutation = useFollowMutation(async (nextRelationship) => {
    setRelationship(nextRelationship);
    await queryClient.invalidateQueries({ queryKey: [...socialKeys.all, "discovery"] });
    router.refresh();
  });

  return (
    <Button
      type="button"
      variant={relationship?.following || relationship?.requested ? "secondary" : "default"}
      disabled={mutation.isPending}
      aria-busy={mutation.isPending}
      aria-pressed={relationship?.following || relationship?.requested || false}
      onClick={() =>
        mutation.mutate({
          username,
          following: !(relationship?.following || relationship?.requested),
        })
      }
    >
      {followButtonLabel(relationship, isPrivate)}
    </Button>
  );
}
