import Image from "next/image";

import type { LibraryEntry, MediaType } from "@tsuki/api/types";

import { MediaLink } from "@/features/media/components/media-link";
import { mediaImageClass, normalizeMediaCompact } from "@/features/media/media";
import { cn } from "@/shared/lib/utils";

import { BENTO_TILE } from "./profile-section";

export function ProfileFavoritesPreview({
  className,
  favorites,
  label,
  mediaType,
}: {
  className?: string;
  favorites: LibraryEntry[];
  label: string;
  mediaType: MediaType;
}) {
  const matching = favorites.filter((entry) => entry.mediaType === mediaType);
  if (matching.length === 0) return null;

  return (
    <div className={cn(BENTO_TILE, "flex flex-col", className)} aria-label={label}>
      <div className="grid flex-1 content-center grid-cols-4 gap-3">
        {matching.map((entry) => {
          if (!entry.media) return null;
          const { coverImage, title } = normalizeMediaCompact(entry.media);
          return (
            <MediaLink
              key={`${entry.mediaType}-${entry.mediaId}`}
              media={entry.media}
              aria-label={title}
              className="relative block aspect-[3/4] min-w-0 overflow-hidden rounded-lg border-[0.5px] border-card bg-card focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
            >
              {coverImage && (
                <Image
                  src={coverImage}
                  alt={title}
                  fill
                  sizes="(max-width: 768px) 22vw, 10vw"
                  className={cn("object-cover", mediaImageClass(entry.mediaType))}
                />
              )}
            </MediaLink>
          );
        })}
      </div>
    </div>
  );
}
