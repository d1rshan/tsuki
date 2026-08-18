import { ProfileLibraryView } from "@/features/profile/views/profile-library-view";
import { requireValidUsername } from "@/features/profile/valid";

export default async function Page({ params }: { params: Promise<{ username: string }> }) {
  const username = await requireValidUsername(params);
  return <ProfileLibraryView username={username} />;
}
