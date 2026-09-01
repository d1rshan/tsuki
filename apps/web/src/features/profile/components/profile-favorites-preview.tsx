import type { LibraryEntry, MediaType } from "@tsuki/api/types";

import { cn } from "@/shared/lib/utils";

import { ProfileMediaCard } from "./profile-media-card";
import { BENTO_CARD } from "./profile-section";

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

  return (
    <div className={cn(BENTO_CARD, "flex flex-col p-5 sm:p-6", className)} aria-label={label}>
      {matching.length === 0 ? (
        <p className="flex-1 content-center text-sm text-muted-foreground">
          No favorites picked yet.
        </p>
      ) : (
        <div className="grid flex-1 content-center grid-cols-4 gap-3">
          {matching.map((entry) => {
            if (!entry.media) return null;
            return (
              <ProfileMediaCard
                key={`${entry.mediaType}-${entry.mediaId}`}
                media={entry.media}
                mediaType={entry.mediaType}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
