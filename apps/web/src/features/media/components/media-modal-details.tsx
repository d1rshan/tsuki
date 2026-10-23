"use client";

import { useQuery } from "@tanstack/react-query";

import type { Media, MediaCompact } from "@tsuki/api/types";

import { ContentState } from "@/shared/components/content-state";
import { Button } from "@/shared/components/ui/button";
import { apiClient } from "@/shared/lib/api-client";

import { mediaKeys } from "../query-keys";
import { MediaDetails } from "../views/media-details";
import { MediaModal } from "./media-modal";
import { MediaPageSkeleton } from "./media-skeletons";

export function MediaModalDetails({
  media,
  morphId,
}: {
  media: Media | Pick<MediaCompact, "id" | "type">;
  morphId?: string;
}) {
  return (
    <MediaModal morphId={morphId}>
      <div className="container mx-auto max-w-5xl px-4">
        {"description" in media ? (
          <MediaDetails media={media} morphId={morphId} />
        ) : (
          <FetchedMediaDetails media={media} morphId={morphId} />
        )}
      </div>
    </MediaModal>
  );
}

function FetchedMediaDetails({
  media,
  morphId,
}: {
  media: Pick<MediaCompact, "id" | "type">;
  morphId?: string;
}) {
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: mediaKeys.detail(media.type, media.id),
    queryFn: async () => {
      const { data, error } = await apiClient.media({ type: media.type })({ id: media.id }).get();
      if (error) throw error;
      return data;
    },
  });

  if (isPending) return <MediaPageSkeleton />;

  if (isError) {
    return (
      <div className="flex min-h-96 flex-col items-center justify-center gap-4">
        <ContentState error title="Failed to load media" description="Please try again." />
        <Button variant="outline" onClick={() => void refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  return <MediaDetails media={data} morphId={morphId} />;
}
