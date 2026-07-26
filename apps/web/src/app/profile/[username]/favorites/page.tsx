import { notFound } from "next/navigation";
import { Suspense } from "react";

import { FavoritesSection, MangaFavoritesSection } from "@/components/profile/profile-overview";
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

  return (
    <div className="space-y-16 pb-16">
      <FavoritesSection favorites={favorites} />
      <MangaFavoritesSection favorites={mangaFavorites} />
    </div>
  );
}
