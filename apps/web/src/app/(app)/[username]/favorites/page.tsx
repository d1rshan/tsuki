import { ProfilePage } from "@/features/profile/components/profile-page";
import { ProfileFavoritesView } from "@/features/profile/views/profile-favorites-view";
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
      {(username) => <ProfileFavoritesView username={username} searchParams={searchParams} />}
    </ProfilePage>
  );
}
