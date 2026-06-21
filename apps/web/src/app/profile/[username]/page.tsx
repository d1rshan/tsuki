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

  const { favorites, recentLogs } = profile;

  return (
    <div className="space-y-16 pb-16">
      <FavoritesSection favorites={favorites} />
      <RecentActivitySection recentLogs={recentLogs} username={username} />
    </div>
  );
}
