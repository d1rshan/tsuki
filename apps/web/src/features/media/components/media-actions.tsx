"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Heart, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import type { MediaType } from "@tsuki/api/types";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { logMediaAction } from "../actions";
import { createFavoriteInput } from "../activity";
import { useMediaActivity } from "../hooks/use-media-activity";
import { mediaKeys } from "../query-keys";
import { LogMediaDialog } from "./log-media-dialog";

export function MediaActions({
  mediaType,
  mediaId,
  total,
}: {
  mediaType: MediaType;
  mediaId: number;
  total?: number | null;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const activity = useMediaActivity(mediaType, mediaId);
  const isFavorite = activity.entry?.isFavorite ?? false;

  const favoriteMutation = useMutation({
    mutationFn: (nextIsFavorite: boolean) =>
      logMediaAction(mediaType, mediaId, createFavoriteInput(nextIsFavorite)),
    onSuccess: async (_, nextIsFavorite) => {
      await queryClient.invalidateQueries({ queryKey: mediaKeys.activity(mediaType, mediaId) });
      toast.success(nextIsFavorite ? "Added to favorites" : "Removed from favorites");
    },
    onError: () => toast.error("Failed to update favorite"),
  });

  if (activity.isError) {
    return (
      <Button
        type="button"
        variant="outline"
        disabled={activity.isFetching}
        onClick={() => void activity.retry()}
      >
        <RefreshCw className={cn(activity.isFetching && "animate-spin")} />
        Retry actions
      </Button>
    );
  }

  function toggleFavorite() {
    if (!activity.isAuthenticated) {
      router.push("/login");
      return;
    }

    favoriteMutation.mutate(!isFavorite);
  }

  return (
    <div className="flex gap-2">
      <LogMediaDialog
        mediaType={mediaType}
        mediaId={mediaId}
        entry={activity.entry}
        review={activity.review}
        disabled={activity.isLoading}
        isFavorite={isFavorite}
        isAuthenticated={activity.isAuthenticated}
        total={total}
      />
      <Button
        type="button"
        variant={isFavorite ? "secondary" : "outline"}
        size="icon"
        disabled={activity.isLoading || favoriteMutation.isPending}
        onClick={toggleFavorite}
        aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        className="shrink-0 rounded-xl border-white/10"
      >
        <Heart
          className={cn(
            "h-5 w-5 transition-all active:scale-75",
            isFavorite && "fill-red-500 text-red-500",
          )}
        />
      </Button>
    </div>
  );
}
