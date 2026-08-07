import type { LibraryEntry } from "@tsuki/api/types";

import { ProfileMediaCard } from "./profile-media-card";

export function LibrarySection({ title, entries }: { title: string; entries: LibraryEntry[] }) {
  if (entries.length === 0) return null;

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold mb-6">
        {title}
        <span className="text-muted-foreground text-lg font-normal ml-2">({entries.length})</span>
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 lg:gap-6">
        {entries.map((entry) => {
          if (!entry.media) return null;
          return (
            <ProfileMediaCard
              key={`${entry.mediaType}-${entry.mediaId}`}
              media={entry.media}
              mediaType={entry.mediaType}
              score={entry.score}
              progress={entry.progress}
            />
          );
        })}
      </div>
    </section>
  );
}
