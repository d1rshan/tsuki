import { ProfileJsonLd } from "@/features/profile/components/profile-json-ld";
import { ProfilePage } from "@/features/profile/components/profile-page";
import { ProfileOverviewView } from "@/features/profile/views/profile-overview-view";

export default function Page({ params }: { params: Promise<{ username: string }> }) {
  return (
    <ProfilePage params={params}>
      {(username) => (
        <>
          <ProfileJsonLd username={username} />
          <ProfileOverviewView username={username} />
        </>
      )}
    </ProfilePage>
  );
}
