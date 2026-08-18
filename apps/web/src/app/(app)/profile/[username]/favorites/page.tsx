import { ProfileFavoritesView } from "@/features/profile/views/profile-favorites-view";

export default async function Page({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  return <ProfileFavoritesView username={username} />;
}
