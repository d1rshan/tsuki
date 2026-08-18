import { ProfileOverviewView } from "@/features/profile/views/profile-overview-view";
import { requireValidUsername } from "@/features/profile/valid";

export default async function Page({ params }: { params: Promise<{ username: string }> }) {
  const username = await requireValidUsername(params);
  return <ProfileOverviewView username={username} />;
}
