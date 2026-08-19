import type { MediaCompact, MediaType } from "@tsuki/api/types";

import { MediaGrid } from "@/features/media/components/media-grid";
import { MediaTypeToggle } from "@/features/media/components/media-type-toggle";

import { DiscoverSection } from "./discover-section";
import { DiscoverMediaCarousel } from "./discover-media-carousel";

type DiscoverMediaTrendingProps = {
  items: MediaCompact[];
  mediaType: MediaType;
  onMediaTypeChange: (value: MediaType) => void;
};

export function DiscoverMediaTrending({
  items,
  mediaType,
  onMediaTypeChange,
}: DiscoverMediaTrendingProps) {
  const topToday = items.slice(0, 10);
  const moreTrending = items.slice(topToday.length);

  return (
    <>
      <DiscoverSection
        title="Top 10 Today"
        actions={<MediaTypeToggle value={mediaType} onChange={onMediaTypeChange} />}
      >
        <DiscoverMediaCarousel items={topToday} mediaType={mediaType} />
      </DiscoverSection>

      <DiscoverSection title="More Trending">
        <MediaGrid items={moreTrending} mediaType={mediaType} />
      </DiscoverSection>
    </>
  );
}
