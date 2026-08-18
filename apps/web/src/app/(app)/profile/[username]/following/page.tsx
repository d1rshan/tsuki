import { ProfileConnectionsView } from "@/features/profile/views/profile-connections-view";

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const [{ username }, { page }] = await Promise.all([params, searchParams]);
  return <ProfileConnectionsView username={username} page={page} type="following" />;
}
