import type { LibraryEntry } from "@tsuki/api/types";

import { ProfileMediaCard } from "./profile-media-card";

export function FavoritesSection({
  title,
  favorites,
}: {
  title: string;
  favorites: LibraryEntry[];
}) {
  if (favorites.length === 0) return null;

  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
      <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
        {favorites.map((entry) => {
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
    </section>
  );
}
