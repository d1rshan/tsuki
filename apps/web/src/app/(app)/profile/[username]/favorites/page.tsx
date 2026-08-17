import { ProfileFavoritesView } from "@/features/profile/views/profile-favorites-view";

export default function Page({ params }: { params: Promise<{ username: string }> }) {
  return <ProfileFavoritesView params={params} />;
}
