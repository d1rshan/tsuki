import type { MediaCompact, MediaType } from "@tsuki/api/types";

import { MediaGrid } from "@/features/media/components/media-grid";
import { MediaTypeToggleButton } from "@/features/media/components/media-type-toggle-button";
import { useMediaType } from "@/features/media/hooks/use-media-type";

import { DiscoverSection } from "./discover-section";
import { DiscoverMediaCarousel } from "./discover-media-carousel";

export function DiscoverMediaTrending({
  trending,
}: {
  trending: Record<MediaType, MediaCompact[]>;
}) {
  const [mediaType, setMediaType] = useMediaType();
  const items = trending[mediaType];
  const topToday = items.slice(0, 10);
  const moreTrending = items.slice(topToday.length);

  return (
    <>
      <DiscoverSection
        title="Top 10 Today"
        actions={<MediaTypeToggleButton mediaType={mediaType} onChange={setMediaType} />}
      >
        <DiscoverMediaCarousel items={topToday} />
      </DiscoverSection>

      <DiscoverSection title="More Trending">
        <MediaGrid items={moreTrending} />
      </DiscoverSection>
    </>
  );
}
