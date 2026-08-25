import { Suspense } from "react";

import { resolveUsername } from "@/features/profile/data";
import { ProfileFavoritesView } from "@/features/profile/views/profile-favorites-view";
import { Loader } from "@/shared/components/loader";

export default async function Page({ params }: { params: Promise<{ username: string }> }) {
  const username = resolveUsername((await params).username);

  return (
    <Suspense fallback={<Loader />}>
      <ProfileFavoritesView username={username} />
    </Suspense>
  );
}
