import type { MediaCompact, MediaType } from "@tsuki/api/types";

import { MediaGrid } from "@/features/media/components/media-grid";
import { useMediaType } from "@/features/media/hooks/use-media-type";
import { MEDIA } from "@/features/media/media";
import { Button } from "@/shared/components/ui/button";

import { DiscoverSection } from "./discover-section";
import { DiscoverMediaCarousel } from "./discover-media-carousel";

export function DiscoverMediaTrending({
  trending,
}: {
  trending: Record<MediaType, MediaCompact[]>;
}) {
  const [mediaType, setMediaType] = useMediaType();
  const nextMediaType = mediaType === "ANIME" ? "MANGA" : "ANIME";
  const items = trending[mediaType];
  const topToday = items.slice(0, 10);
  const moreTrending = items.slice(topToday.length);

  return (
    <>
      <DiscoverSection
        title="Top 10 Today"
        actions={
          <Button
            type="button"
            size="lg"
            onClick={() => setMediaType(nextMediaType)}
            aria-label={`Switch from ${MEDIA[mediaType].label} to ${MEDIA[nextMediaType].label}`}
          >
            {MEDIA[mediaType].label}
          </Button>
        }
      >
        <DiscoverMediaCarousel items={topToday} />
      </DiscoverSection>

      <DiscoverSection title="More Trending">
        <MediaGrid items={moreTrending} />
      </DiscoverSection>
    </>
  );
}
