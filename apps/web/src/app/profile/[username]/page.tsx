import { notFound } from "next/navigation";

import {
  FavoritesSection,
  RecentActivitySection,
} from "@/modules/profile/components/profile-overview";
import { getProfileOverview } from "@/modules/profile/queries";

export default async function ProfileOverviewPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const { data, error } = await getProfileOverview(username);

  if (error || !data) return notFound();

  return (
    <div className="space-y-16 pb-16">
      <FavoritesSection title="Favorites" favorites={data.favorites} />
      <RecentActivitySection
        title="Recent Activity"
        recentLogs={data.recentLogs}
        username={username}
      />
    </div>
  );
}
