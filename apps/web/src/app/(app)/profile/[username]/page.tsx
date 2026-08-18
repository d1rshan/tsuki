import { ProfileOverviewView } from "@/features/profile/views/profile-overview-view";

export default async function Page({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  return <ProfileOverviewView username={username} />;
}
