import { ProfilePage } from "@/features/profile/components/profile-page";
import { ProfileReviewsView } from "@/features/profile/views/profile-reviews-view";
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
      {(username) => <ProfileReviewsView username={username} searchParams={searchParams} />}
    </ProfilePage>
  );
}
