import { ProfileConnectionsPage } from "@/features/profile/pages/profile-connections-page";

export default function FollowingPage({
  params,
  searchParams,
}: {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  return <ProfileConnectionsPage params={params} searchParams={searchParams} type="following" />;
}
