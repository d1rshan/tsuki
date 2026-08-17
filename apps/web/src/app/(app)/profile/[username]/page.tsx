import { ProfileOverviewView } from "@/features/profile/views/profile-overview-view";

export default function Page({ params }: { params: Promise<{ username: string }> }) {
  return <ProfileOverviewView params={params} />;
}
