import { ProfilePage } from "@/features/profile/components/profile-page";
import { ProfileLibraryView } from "@/features/profile/views/profile-library-view";

export default function Page({ params }: { params: Promise<{ username: string }> }) {
  return (
    <ProfilePage params={params}>
      {(username) => <ProfileLibraryView username={username} mediaType="ANIME" />}
    </ProfilePage>
  );
}
