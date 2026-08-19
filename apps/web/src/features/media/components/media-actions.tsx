"use client";

import { useRouter } from "next/navigation";
import { Heart, RefreshCw } from "lucide-react";

import type { MediaType } from "@tsuki/api/types";

import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

import { useFavoriteMediaMutation } from "../hooks/use-favorite-media-mutation";
import { useMediaActivity } from "../hooks/use-media-activity";
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
  const activity = useMediaActivity(mediaType, mediaId);
  const isFavorite = activity.entry?.isFavorite ?? false;
  const favoriteMutation = useFavoriteMediaMutation(mediaType, mediaId);

  if (activity.isError) {
    return (
      <Button
        type="button"
        variant="outline"
        disabled={activity.isPending}
        onClick={() => void activity.retry()}
      >
        <RefreshCw data-icon="inline-start" className={cn(activity.isPending && "animate-spin")} />
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
      <LogMediaDialog mediaType={mediaType} mediaId={mediaId} activity={activity} total={total} />
      <Button
        type="button"
        variant={isFavorite ? "secondary" : "outline"}
        size="icon"
        disabled={activity.isPending || favoriteMutation.isPending}
        onClick={toggleFavorite}
      >
        <Heart className={cn(isFavorite && "fill-current")} />
      </Button>
    </div>
  );
}
