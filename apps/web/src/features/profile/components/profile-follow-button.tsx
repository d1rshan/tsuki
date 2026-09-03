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
}: {
  initialRelationship: FollowRelationship | null;
  username: string;
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
      variant={relationship?.following ? "secondary" : "default"}
      disabled={mutation.isPending}
      aria-busy={mutation.isPending}
      aria-pressed={relationship?.following ?? false}
      onClick={() => mutation.mutate({ username, following: !relationship?.following })}
    >
      {followButtonLabel(relationship)}
    </Button>
  );
}
