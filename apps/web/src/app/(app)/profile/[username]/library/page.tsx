import { ProfileLibraryView } from "@/features/profile/views/profile-library-view";

export default async function Page({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  return <ProfileLibraryView username={username} />;
}
