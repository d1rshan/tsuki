import { Suspense } from "react";
import { notFound } from "next/navigation";

import type { LibraryEntry, MediaType } from "@tsuki/api/types";

import { MEDIA } from "@/modules/media/config";
import { FavoritesSection } from "@/modules/profile/components/profile-overview";
import { ProfileMediaToggle } from "@/modules/profile/components/profile-media-toggle";
import { getProfileLibrary } from "@/modules/profile/queries";

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
      <div className="text-center py-20 text-muted-foreground">
        <p className="text-sm font-medium">
          No favorite {MEDIA[mediaType].label.toLowerCase()} yet.
        </p>
      </div>
    );
  }

  return <FavoritesSection title={`${MEDIA[mediaType].label} Favorites`} favorites={favorites} />;
}

export default async function ProfileFavoritesPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  return (
    <Suspense
      fallback={
        <div className="py-20 flex justify-center">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <FavoritesContent username={username} />
    </Suspense>
  );
}

async function FavoritesContent({ username }: { username: string }) {
  const { data, error } = await getProfileLibrary(username);

  if (error || !data) return notFound();

  return (
    <ProfileMediaToggle
      anime={<FavoritesForType entries={data} mediaType="anime" />}
      manga={<FavoritesForType entries={data} mediaType="manga" />}
    />
  );
}
