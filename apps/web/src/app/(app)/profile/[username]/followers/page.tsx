import { ProfileConnectionsView } from "@/features/profile/views/profile-connections-view";
import { requireValidUsername } from "@/features/profile/valid";

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const [username, { page }] = await Promise.all([requireValidUsername(params), searchParams]);
  return <ProfileConnectionsView username={username} page={page} type="followers" />;
}
