import type { MediaCompact, MediaType } from "@tsuki/api/types";

import { MediaGrid } from "@/features/media/components/media-grid";
import { useMediaType } from "@/features/media/hooks/use-media-type";

import { DiscoverSection } from "./discover-section";

export function DiscoverMediaTrending({
  trending,
}: {
  trending: Record<MediaType, MediaCompact[]>;
}) {
  const [mediaType] = useMediaType();
  const items = trending[mediaType];

  return (
    <DiscoverSection title="Trending">
      <MediaGrid items={items} />
    </DiscoverSection>
  );
}
