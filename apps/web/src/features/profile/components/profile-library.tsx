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
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 @min-[40rem]:grid-cols-3 @min-[40rem]:gap-x-6 @min-[64rem]:grid-cols-5">
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
