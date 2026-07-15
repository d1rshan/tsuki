import { notFound } from "next/navigation";
import { Suspense } from "react";

import { FavoritesSection } from "@/components/profile/profile-overview";
import { getProfileLibrary } from "../queries";

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
  const { data: library, error } = await getProfileLibrary(username);

  if (error || !library) return notFound();

  const favorites = library.filter((entry) => entry.isFavorite);

  return (
    <div className="space-y-16 pb-16">
      <FavoritesSection favorites={favorites} />
    </div>
  );
}
