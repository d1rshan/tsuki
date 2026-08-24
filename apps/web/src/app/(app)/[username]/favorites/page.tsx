import { Suspense } from "react";
import { notFound } from "next/navigation";

import { ProfileFavoritesView } from "@/features/profile/views/profile-favorites-view";
import { parseProfileUsername } from "@/features/profile/utils";
import { Loader } from "@/shared/components/loader";

export default function Page({ params }: { params: Promise<{ username: string }> }) {
  return (
    <Suspense fallback={<Loader />}>
      <FavoritesContent params={params} />
    </Suspense>
  );
}

async function FavoritesContent({ params }: { params: Promise<{ username: string }> }) {
  const username = parseProfileUsername((await params).username);
  if (!username) notFound();

  return <ProfileFavoritesView username={username} />;
}
