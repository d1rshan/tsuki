import { ProfilePage } from "@/features/profile/components/profile-page";
import { ProfileLibraryView } from "@/features/profile/views/profile-library-view";
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
      {(username) => (
        <ProfileLibraryView username={username} mediaType="ANIME" searchParams={searchParams} />
      )}
    </ProfilePage>
  );
}
