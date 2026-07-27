import { notFound } from "next/navigation";

import { FavoritesSection, RecentActivitySection } from "@/components/profile/profile-overview";
import { getProfileOverview } from "./queries";

export default async function ProfileOverviewPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const { data: profile, error } = await getProfileOverview(username);

  if (error) return notFound();

  const { favorites, recentLogs, mangaFavorites, recentMangaLogs } = profile;

  return (
    <div className="space-y-16 pb-16">
      <FavoritesSection title="Anime Favorites" favorites={favorites} />
      <RecentActivitySection
        title="Recent Anime Activity"
        recentLogs={recentLogs}
        username={username}
      />
      <FavoritesSection title="Manga Favorites" favorites={mangaFavorites} />
      <RecentActivitySection
        title="Recent Manga Activity"
        recentLogs={recentMangaLogs}
        username={username}
      />
    </div>
  );
}
