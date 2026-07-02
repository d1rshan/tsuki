import { notFound } from "next/navigation";
import { Suspense } from "react";

import { FavoritesSection, RecentActivitySection } from "@/components/profile/profile-overview";
import { getProfileOverview } from "./queries";

export default async function ProfileOverviewPage({
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
      <OverviewContent username={username} />
    </Suspense>
  );
}

async function OverviewContent({ username }: { username: string }) {
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
