import { Suspense } from "react";
import { notFound } from "next/navigation";

import type { LibraryEntry, MediaType } from "@tsuki/api/types";

import { MEDIA } from "@/features/media/media";
import { FavoritesSection } from "@/features/profile/components/profile-overview";
import { ProfileMediaToggle } from "@/features/profile/components/profile-media-toggle";
import { LoadingIndicator } from "@/shared/components/loading-indicator";
import { parseUsername } from "@/shared/lib/username";

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
    return (
      <p className="py-20 text-center text-sm text-muted-foreground">
        No favorite {MEDIA[mediaType].label.toLowerCase()} yet.
      </p>
    );
  }

  return <FavoritesSection title={`${MEDIA[mediaType].label} Favorites`} favorites={favorites} />;
}

export function ProfileFavoritesPage({ params }: { params: Promise<{ username: string }> }) {
  return (
    <Suspense fallback={<LoadingIndicator label="Loading favorites" />}>
      <ProfileFavoritesContent params={params} />
    </Suspense>
  );
}

async function ProfileFavoritesContent({ params }: { params: Promise<{ username: string }> }) {
  const username = parseUsername((await params).username);
  if (!username) notFound();

  const entries = await getProfileLibrary(username);
  if (!entries) notFound();

  return (
    <ProfileMediaToggle
      anime={<FavoritesForType entries={entries} mediaType="ANIME" />}
      manga={<FavoritesForType entries={entries} mediaType="MANGA" />}
    />
  );
}
