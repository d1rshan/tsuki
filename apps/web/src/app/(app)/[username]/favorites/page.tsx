import { notFound } from "next/navigation";

import { ProfileFavoritesView } from "@/features/profile/views/profile-favorites-view";
import { parseProfileUsername } from "@/features/profile/utils";

export default async function Page({ params }: { params: Promise<{ username: string }> }) {
  const username = parseProfileUsername((await params).username);
  if (!username) notFound();

  return <ProfileFavoritesView username={username} />;
}
