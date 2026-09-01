import { notFound } from "next/navigation";

import type { LibraryEntry, MediaType } from "@tsuki/api/types";

import { MEDIA } from "@/features/media/media";
import { ContentState } from "@/shared/components/content-state";

import { ProfileMediaCard } from "../components/profile-media-card";
import { ProfileSection } from "../components/profile-section";
import { getProfileLibrary } from "../data";

function FavoritesForType({
  entries,
  mediaType,
}: {
  entries: LibraryEntry[];
  mediaType: MediaType;
}) {
  const favorites = entries.filter((entry) => entry.mediaType === mediaType && entry.isFavorite);

  return (
    <ProfileSection title={`${MEDIA[mediaType].label} Favorites`} count={favorites.length}>
      {favorites.length === 0 ? (
        <ContentState title={`No favorite ${MEDIA[mediaType].label.toLowerCase()} yet`} />
      ) : (
        <div className="grid grid-cols-4 gap-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7">
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
      )}
    </ProfileSection>
  );
}

export async function ProfileFavoritesView({ username }: { username: string }) {
  const entries = await getProfileLibrary(username);
  if (!entries) notFound();

  return (
    <div className="space-y-16 pb-16">
      <FavoritesForType entries={entries} mediaType="ANIME" />
      <FavoritesForType entries={entries} mediaType="MANGA" />
    </div>
  );
}
