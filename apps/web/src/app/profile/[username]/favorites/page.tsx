import { notFound } from "next/navigation";
import { Suspense } from "react";

import { FavoritesSection } from "@/components/profile/profile-overview";
import { ProfileMediaToggle } from "@/components/profile/profile-media-toggle";
import { getProfileLibrary, getProfileMangaLibrary } from "../queries";

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
  const [{ data: library, error }, { data: mangaLibrary, error: mangaError }] = await Promise.all([
    getProfileLibrary(username),
    getProfileMangaLibrary(username),
  ]);

  if (error || !library || mangaError || !mangaLibrary) return notFound();

  const favorites = library.filter((entry) => entry.isFavorite);
  const mangaFavorites = mangaLibrary.filter((entry) => entry.isFavorite);

  const animeContent =
    favorites.length === 0 ? (
      <div className="text-center py-20 text-muted-foreground">
        <p className="text-sm font-medium">No favorite anime yet.</p>
      </div>
    ) : (
      <FavoritesSection title="Anime Favorites" favorites={favorites} />
    );

  const mangaContent =
    mangaFavorites.length === 0 ? (
      <div className="text-center py-20 text-muted-foreground">
        <p className="text-sm font-medium">No favorite manga yet.</p>
      </div>
    ) : (
      <FavoritesSection title="Manga Favorites" favorites={mangaFavorites} />
    );

  return <ProfileMediaToggle anime={animeContent} manga={mangaContent} />;
}
