"use client";

import { Bookmark, BookmarkCheck, LoaderCircle, RefreshCw } from "lucide-react";

import type { MediaType } from "@tsuki/api/types";

import { useAuthDialog } from "@/features/auth/hooks/use-auth-dialog";
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
  const { openAuth } = useAuthDialog();
  const activity = useMediaActivity(mediaType, mediaId);
  const watchlistMutation = useWatchlistMediaMutation(mediaType, mediaId);
  const listLabel = mediaType === "ANIME" ? "watchlist" : "read list";
  const isListed = Boolean(activity.entry);
  const watchlistLabel = isListed ? `Remove from ${listLabel}` : `Add to ${listLabel}`;

  if (activity.isError) {
    return (
      <Button
        variant="secondary"
        size="sm"
        className="w-full"
        onClick={() => void activity.retry()}
      >
        <RefreshCw />
        Retry actions
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <Button
        variant="secondary"
        size="icon-sm"
        aria-label={watchlistLabel}
        aria-pressed={isListed}
        title={watchlistLabel}
        disabled={activity.isPending || watchlistMutation.isPending}
        onClick={() => {
          if (!activity.isAuthenticated) {
            openAuth();
            return;
          }
          watchlistMutation.mutate(!isListed);
        }}
      >
        {watchlistMutation.isPending ? (
          <LoaderCircle className="animate-spin" />
        ) : isListed ? (
          <BookmarkCheck />
        ) : (
          <Bookmark />
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
