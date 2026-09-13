import { ProfilePage } from "@/features/profile/components/profile-page";
import { ProfileSocialView } from "@/features/profile/views/profile-social-view";
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
      {(username) => <ProfileSocialView username={username} searchParams={searchParams} />}
    </ProfilePage>
  );
}
