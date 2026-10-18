import { ProfilePage } from "@/features/profile/components/profile-page";
import { ProfileStatsView } from "@/features/profile/views/profile-stats-view";
import type { ProfileSearchParams } from "@/features/profile/utils";

export default function Page({
  params,
  searchParams,
}: {
  params: Promise<{ username: string }>;
  searchParams: Promise<ProfileSearchParams>;
}) {
  return (
    <ProfilePage params={params}>
      {(username) => <ProfileStatsView username={username} searchParams={searchParams} />}
    </ProfilePage>
  );
}
