import { notFound } from "next/navigation";

import type { MediaType } from "@tsuki/api/types";

import { MediaBanner } from "../components/media-banner";
import { MediaContent } from "../components/media-content";
import { MediaHeader } from "../components/media-header";
import { MediaSidebar } from "../components/media-sidebar";
import { getMedia } from "../data";
import { normalizeMedia, parseMediaId } from "../media";

export async function MediaView({ mediaType, id }: { mediaType: MediaType; id: string }) {
  const mediaId = parseMediaId(id);
  if (!mediaId) notFound();

  const media = await getMedia(mediaType, mediaId);
  if (!media) notFound();

  const normalizedMedia = normalizeMedia(media);
  const {
    averageScore,
    bannerImage,
    count,
    coverImage,
    descriptionText,
    details,
    format,
    genres,
    hasBannerImage,
    id: normalizedId,
    links,
    seasonLabel,
    statusLabel,
    title,
    titleNative,
    trailerUrl,
    type: normalizedType,
  } = normalizedMedia;

  return (
    <>
      <div className="relative left-1/2 w-dvw -translate-x-1/2">
        <MediaBanner
          image={bannerImage}
          title={title}
          type={normalizedType}
          hasBannerImage={hasBannerImage}
        />
      </div>
      <div className="pb-16">
        <MediaHeader
          averageScore={averageScore}
          coverImage={coverImage}
          format={format}
          seasonLabel={seasonLabel}
          statusLabel={statusLabel}
          title={title}
          titleNative={titleNative}
          type={normalizedType}
        />
        <div className="mt-8 grid gap-12 md:grid-cols-[200px_1fr] lg:grid-cols-[250px_1fr]">
          <MediaSidebar
            count={count}
            details={details}
            genres={genres}
            id={normalizedId}
            links={links}
            type={normalizedType}
          />
          <MediaContent descriptionText={descriptionText} trailerUrl={trailerUrl} />
        </div>
      </div>
    </>
  );
}
