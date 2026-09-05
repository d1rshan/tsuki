import { ProfilePage } from "@/features/profile/components/profile-page";
import { ProfileReviewsView } from "@/features/profile/views/profile-reviews-view";

export default function Page({ params }: { params: Promise<{ username: string }> }) {
  return (
    <ProfilePage params={params}>
      {(username) => <ProfileReviewsView username={username} />}
    </ProfilePage>
  );
}
