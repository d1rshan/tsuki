import { ProfileConnectionsView } from "@/features/profile/views/profile-connections-view";

export default function Page({
  params,
  searchParams,
}: {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  return <ProfileConnectionsView params={params} searchParams={searchParams} type="followers" />;
}
