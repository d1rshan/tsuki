import { type AnimeCompact, type MangaCompact } from "@/lib/types";
import { type MediaType } from "@/lib/media";

import { MediaCard } from "./media-card";

export function MediaGrid({
  items,
  mediaType,
}: {
  items: (AnimeCompact | MangaCompact)[];
  mediaType: MediaType;
}) {
  return (
    <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
      {items.map((media) => (
        <MediaCard key={media.id} media={media} mediaType={mediaType} />
      ))}
    </div>
  );
}
