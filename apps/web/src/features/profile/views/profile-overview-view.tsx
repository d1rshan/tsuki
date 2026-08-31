import { notFound } from "next/navigation";

import { FavoritesSection } from "@/features/profile/components/profile-overview";
import { ProfileActivityHeatmap } from "@/features/profile/components/profile-activity-heatmap";
import { ProfileActivityStream } from "@/features/profile/components/profile-activity-stream";

import { getProfileOverview } from "../data";

export async function ProfileOverviewView({ username }: { username: string }) {
  const profile = await getProfileOverview(username);
  if (!profile) notFound();

  return (
    <div className="space-y-16 pb-16">
      <ProfileActivityHeatmap activity={profile.activity} />
      <FavoritesSection title="Favorites" favorites={profile.favorites} />
      <ProfileActivityStream title="Recent Activity" username={username} />
    </div>
  );
}
