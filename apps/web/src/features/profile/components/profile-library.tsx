import type { LibraryEntry } from "@tsuki/api/types";

import { ProfileMediaCard } from "./profile-media-card";

/** Media wall shared by the library and favorites routes. */
export function ProfileMediaGrid({
  entries,
  progress,
  score,
}: {
  entries: LibraryEntry[];
  progress?: boolean;
  score?: boolean;
}) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {entries.map((entry) => {
        if (!entry.media) return null;
        return (
          <ProfileMediaCard
            key={`${entry.mediaType}-${entry.mediaId}`}
            media={entry.media}
            mediaType={entry.mediaType}
            score={score ? entry.score : undefined}
            progress={progress ? entry.progress : undefined}
          />
        );
      })}
    </div>
  );
}
