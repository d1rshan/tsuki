import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import type { MediaType } from "@tsuki/api/types";

import {
  getMediaBannerImage,
  getMediaCoverImage,
  getMediaTitle,
  mediaDescriptionText,
  parseMediaId,
} from "../media";
import { MediaBanner } from "../components/media-banner";
import { MediaDetails } from "../components/media-details";
import { MediaHeader } from "../components/media-header";
import { MediaPageSkeleton } from "../components/media-skeletons";
import { getMedia } from "../data";

/**
 * Anime and manga keep separate URLs, but the page itself is identical — the
 * only difference is which type is fetched.
 */
export function MediaDetailsView({ mediaType, id }: { mediaType: MediaType; id: string }) {
  return (
    <Suspense fallback={<MediaPageSkeleton />}>
      <MediaDetailsContent mediaType={mediaType} id={id} />
    </Suspense>
  );
}

async function MediaDetailsContent({ mediaType, id }: { mediaType: MediaType; id: string }) {
  const mediaId = parseMediaId(id);
  if (!mediaId) notFound();

  const media = await getMedia(mediaType, mediaId);

  if (!media) {
    notFound();
  }

  const title = getMediaTitle(media);
  const bannerImage = getMediaBannerImage(media);

  return (
    <div className="pb-16">
      <MediaBanner
        bannerImage={bannerImage}
        isFallbackImage={Boolean(bannerImage && !media.bannerImage)}
        mediaType={mediaType}
        title={title}
      />
      <div className="container mx-auto max-w-6xl px-4">
        <MediaHeader media={media} title={title} coverImage={getMediaCoverImage(media)} />
        <MediaDetails media={media} />
      </div>
    </div>
  );
}

export async function getMediaMetadata(mediaType: MediaType, id: string): Promise<Metadata> {
  const mediaId = parseMediaId(id);
  if (!mediaId) return { title: "Media not found" };

  const media = await getMedia(mediaType, mediaId);
  if (!media) return { title: "Media not found" };

  const title = getMediaTitle(media);
  const image = getMediaBannerImage(media);

  return {
    title,
    description: mediaDescriptionText(media.description).slice(0, 160),
    openGraph: image ? { images: [image] } : undefined,
  };
}
