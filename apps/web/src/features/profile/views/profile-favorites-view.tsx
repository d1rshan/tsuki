import { notFound } from "next/navigation";

import type { LibraryEntry, MediaType } from "@tsuki/api/types";

import { MEDIA } from "@/features/media/media";
import { ContentState } from "@/shared/components/content-state";

import { FavoritesSection } from "../components/profile-overview";
import { ProfileMediaToggle } from "../components/profile-media-toggle";
import { getProfileLibrary } from "../data";

function FavoritesForType({
  entries,
  mediaType,
}: {
  entries: LibraryEntry[];
  mediaType: MediaType;
}) {
  const favorites = entries.filter((entry) => entry.mediaType === mediaType && entry.isFavorite);
  if (favorites.length === 0)
    return <ContentState title={`No favorite ${MEDIA[mediaType].label.toLowerCase()} yet`} />;

  return <FavoritesSection title={`${MEDIA[mediaType].label} Favorites`} favorites={favorites} />;
}

export async function ProfileFavoritesView({ username }: { username: string }) {
  const entries = await getProfileLibrary(username);
  if (!entries) notFound();

  return (
    <ProfileMediaToggle
      anime={<FavoritesForType entries={entries} mediaType="ANIME" />}
      manga={<FavoritesForType entries={entries} mediaType="MANGA" />}
    />
  );
}
