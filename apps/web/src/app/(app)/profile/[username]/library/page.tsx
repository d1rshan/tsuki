import { ProfileLibraryView } from "@/features/profile/views/profile-library-view";

export default function Page({ params }: { params: Promise<{ username: string }> }) {
  return <ProfileLibraryView params={params} />;
}
