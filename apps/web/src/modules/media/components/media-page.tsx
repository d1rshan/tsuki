import { Suspense } from "react";
import { notFound } from "next/navigation";

import type { MediaType } from "@tsuki/api/types";

import { getMediaBannerImage, getMediaCoverImage, getMediaTitle } from "../config";
import { getMedia } from "../queries";
import { MediaBanner } from "./media-banner";
import { MediaDetails } from "./media-details";
import { MediaHeader } from "./media-header";
import { MediaPageSkeleton } from "./media-skeletons";

/**
 * Anime and manga keep separate URLs, but the page itself is identical — the
 * only difference is which type is fetched.
 */
export function MediaPage({
  mediaType,
  params,
}: {
  mediaType: MediaType;
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<MediaPageSkeleton />}>
      <MediaPageContent mediaType={mediaType} params={params} />
    </Suspense>
  );
}

async function MediaPageContent({
  mediaType,
  params,
}: {
  mediaType: MediaType;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { data: media, error } = await getMedia(mediaType, Number(id));

  if (error) return notFound();

  const title = getMediaTitle(media);

  return (
    <div className="pb-16">
      <MediaBanner bannerImage={getMediaBannerImage(media)} title={title} />
      <div className="container mx-auto max-w-6xl px-4">
        <MediaHeader media={media} title={title} coverImage={getMediaCoverImage(media)} />
        <MediaDetails media={media} />
      </div>
    </div>
  );
}
