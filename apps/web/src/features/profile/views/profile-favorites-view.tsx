import { Suspense } from "react";
import { notFound } from "next/navigation";

import type { LibraryEntry, MediaType } from "@tsuki/api/types";

import { MEDIA } from "@/features/media/media";
import { FavoritesSection } from "@/features/profile/components/profile-overview";
import { ProfileMediaToggle } from "@/features/profile/components/profile-media-toggle";
import { Loader } from "@/shared/components/loader";
import { ContentState } from "@/shared/components/content-state";

import { getProfileLibrary } from "../data";

function FavoritesForType({
  entries,
  mediaType,
}: {
  entries: LibraryEntry[];
  mediaType: MediaType;
}) {
  const favorites = entries.filter((entry) => entry.mediaType === mediaType && entry.isFavorite);

  if (favorites.length === 0) {
    return <ContentState title={`No favorite ${MEDIA[mediaType].label.toLowerCase()} yet`} />;
  }

  return <FavoritesSection title={`${MEDIA[mediaType].label} Favorites`} favorites={favorites} />;
}

export function ProfileFavoritesView({ username }: { username: string }) {
  return (
    <Suspense fallback={<Loader />}>
      <ProfileFavoritesContent username={username} />
    </Suspense>
  );
}

async function ProfileFavoritesContent({ username }: { username: string }) {
  const entries = await getProfileLibrary(username);
  if (!entries) notFound();

  return (
    <ProfileMediaToggle
      anime={<FavoritesForType entries={entries} mediaType="ANIME" />}
      manga={<FavoritesForType entries={entries} mediaType="MANGA" />}
    />
  );
}
