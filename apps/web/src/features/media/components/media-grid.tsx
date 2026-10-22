import type { MediaCompact } from "@tsuki/api/types";

import { MediaCard } from "./media-card";

export function MediaGrid({ items }: { items: MediaCompact[] }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-5">
      {items.map((media) => (
        <MediaCard key={media.id} media={media} />
      ))}
    </div>
  );
}
