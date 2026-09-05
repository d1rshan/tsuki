import { ProfilePage } from "@/features/profile/components/profile-page";
import { ProfileSocialView } from "@/features/profile/views/profile-social-view";

export default function Page({ params }: { params: Promise<{ username: string }> }) {
  return (
    <ProfilePage params={params}>
      {(username) => <ProfileSocialView username={username} />}
    </ProfilePage>
  );
}
