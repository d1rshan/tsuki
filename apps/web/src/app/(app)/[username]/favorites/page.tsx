import { ProfilePage } from "@/features/profile/components/profile-page";
import { ProfileFavoritesView } from "@/features/profile/views/profile-favorites-view";

export default function Page({ params }: { params: Promise<{ username: string }> }) {
  return (
    <ProfilePage params={params}>
      {(username) => <ProfileFavoritesView username={username} />}
    </ProfilePage>
  );
}
