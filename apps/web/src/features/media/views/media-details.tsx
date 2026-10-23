import type { Media } from "@tsuki/api/types";

import { MediaBanner } from "../components/media-banner";
import { MediaContent } from "../components/media-content";
import { MediaHeader } from "../components/media-header";
import { MediaDetailsReveal } from "../components/media-layout-group";
import { MediaSidebar } from "../components/media-sidebar";
import { normalizeMedia } from "../media";

export function MediaDetails({ media, morphId }: { media: Media; morphId?: string }) {
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
      <MediaDetailsReveal morphId={morphId} className="relative left-1/2 w-dvw -translate-x-1/2">
        <MediaBanner
          image={bannerImage}
          title={title}
          type={normalizedType}
          hasBannerImage={hasBannerImage}
        />
      </MediaDetailsReveal>
      <div className="pb-16">
        <MediaHeader
          morphId={morphId}
          averageScore={averageScore}
          coverImage={coverImage}
          format={format}
          seasonLabel={seasonLabel}
          statusLabel={statusLabel}
          title={title}
          titleNative={titleNative}
          type={normalizedType}
        />
        <MediaDetailsReveal
          morphId={morphId}
          className="mt-8 grid gap-12 md:grid-cols-[200px_1fr] lg:grid-cols-[250px_1fr]"
        >
          <MediaSidebar
            count={count}
            details={details}
            genres={genres}
            id={normalizedId}
            links={links}
            type={normalizedType}
          />
          <MediaContent descriptionText={descriptionText} trailerUrl={trailerUrl} />
        </MediaDetailsReveal>
      </div>
    </>
  );
}
