"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { useSession } from "@tsuki/auth/client";

import { Button } from "@/components/ui/button";
import { apiClient } from "@/shared/lib/api-client";

import { setFollowingAction } from "../actions";
import { followButtonLabel } from "../follow";
import { profileKeys } from "../query-keys";

async function getRelationship(username: string) {
  const { data, error } = await apiClient.users({ username }).relationship.get();
  if (error) throw error;

  return data;
}

export function ProfileFollowButton({ username }: { username: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session, isPending: isSessionPending } = useSession();
  const viewerId = session?.user.id ?? null;
  const isAuthenticated = Boolean(viewerId);
  const queryKey = profileKeys.relationship(viewerId, username);
  const relationshipQuery = useQuery({
    queryKey,
    queryFn: () => getRelationship(username),
    enabled: isAuthenticated,
  });
  const relationship = relationshipQuery.data;
  const mutation = useMutation({
    mutationFn: (following: boolean) => setFollowingAction(username, following),
    onSuccess: (nextRelationship) => {
      queryClient.setQueryData(queryKey, nextRelationship);
      router.refresh();
    },
    onError: () => toast.error("Failed to update follow"),
  });

  function toggleFollow() {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    mutation.mutate(!relationship?.following);
  }

  if (relationshipQuery.isError) {
    return (
      <Button
        type="button"
        variant="outline"
        disabled={relationshipQuery.isFetching}
        onClick={() => void relationshipQuery.refetch()}
      >
        <RefreshCw data-icon="inline-start" />
        Retry follow
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant={relationship?.following ? "secondary" : "default"}
      disabled={
        isSessionPending || mutation.isPending || (isAuthenticated && relationshipQuery.isLoading)
      }
      onClick={toggleFollow}
      aria-busy={mutation.isPending}
      aria-pressed={relationship?.following ?? false}
    >
      {followButtonLabel(relationship)}
    </Button>
  );
}
