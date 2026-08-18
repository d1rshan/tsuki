import { Suspense } from "react";
import { notFound } from "next/navigation";

import {
  FavoritesSection,
  RecentActivitySection,
} from "@/features/profile/components/profile-overview";
import { ProfileActivityHeatmap } from "@/features/profile/components/profile-activity-heatmap";
import { parseUsername } from "@/shared/lib/username";

import { getProfileOverview } from "../data";

export function ProfileOverviewView({ username }: { username: string }) {
  return (
    <Suspense fallback={null}>
      <ProfileOverviewContent username={username} />
    </Suspense>
  );
}

async function ProfileOverviewContent({ username }: { username: string }) {
  const parsedUsername = parseUsername(username);
  if (!parsedUsername) notFound();

  const profile = await getProfileOverview(parsedUsername);
  if (!profile) notFound();

  return (
    <div className="space-y-16 pb-16">
      <ProfileActivityHeatmap activity={profile.activity} />
      <FavoritesSection title="Favorites" favorites={profile.favorites} />
      <RecentActivitySection
        title="Recent Activity"
        recentLogs={profile.recentLogs}
        username={parsedUsername}
      />
    </div>
  );
}
