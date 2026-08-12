import { ProfileConnectionsPage } from "@/features/profile/pages/profile-connections-page";

export default function FollowersPage({ params }: { params: Promise<{ username: string }> }) {
  return <ProfileConnectionsPage params={params} type="followers" />;
}
