import { notFound } from "next/navigation";

import {
  FavoritesSection,
  RecentActivitySection,
} from "@/features/profile/components/profile-overview";
import { parseUsername } from "@/shared/lib/username";

import { getProfileOverview } from "../data";

export async function ProfileOverviewPage({ params }: { params: Promise<{ username: string }> }) {
  const username = parseUsername((await params).username);
  if (!username) notFound();

  const profile = await getProfileOverview(username);
  if (!profile) notFound();

  return (
    <div className="space-y-16 pb-16">
      <FavoritesSection title="Favorites" favorites={profile.favorites} />
      <RecentActivitySection
        title="Recent Activity"
        recentLogs={profile.recentLogs}
        username={username}
      />
    </div>
  );
}
