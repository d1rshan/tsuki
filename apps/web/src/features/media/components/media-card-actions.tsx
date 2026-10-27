"use client";

import { useRouter } from "next/navigation";
import { Check, LoaderCircle, Plus, RefreshCw } from "lucide-react";

import type { MediaType } from "@tsuki/api/types";

import { Button } from "@/shared/components/ui/button";

import { useMediaActivity } from "../hooks/use-media-activity";
import { useWatchlistMediaMutation } from "../hooks/use-watchlist-media-mutation";
import { LogMediaDialog } from "./log-media-dialog";

export function MediaCardActions({
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
  const watchlistMutation = useWatchlistMediaMutation(mediaType, mediaId);
  const listLabel = mediaType === "ANIME" ? "watchlist" : "read list";
  const isListed = Boolean(activity.entry);
  const watchlistLabel = isListed ? `Remove from ${listLabel}` : `Add to ${listLabel}`;

  if (activity.isError) {
    return (
      <Button size="sm" className="w-full" onClick={() => void activity.retry()}>
        <RefreshCw />
        Retry actions
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <Button
        size="icon-sm"
        aria-label={watchlistLabel}
        aria-pressed={isListed}
        title={watchlistLabel}
        disabled={activity.isPending || watchlistMutation.isPending}
        onClick={() => {
          if (!activity.isAuthenticated) {
            router.push("/login");
            return;
          }
          watchlistMutation.mutate(!isListed);
        }}
      >
        {watchlistMutation.isPending ? (
          <LoaderCircle className="animate-spin" />
        ) : isListed ? (
          <Check />
        ) : (
          <Plus />
        )}
      </Button>
      <LogMediaDialog
        activity={activity}
        mediaId={mediaId}
        mediaType={mediaType}
        total={total}
        compact
      />
    </div>
  );
}
