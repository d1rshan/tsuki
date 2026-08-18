import { ProfileFavoritesView } from "@/features/profile/views/profile-favorites-view";
import { requireValidUsername } from "@/features/profile/valid";

export default async function Page({ params }: { params: Promise<{ username: string }> }) {
  const username = await requireValidUsername(params);
  return <ProfileFavoritesView username={username} />;
}
