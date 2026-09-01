import { Suspense } from "react";

import { resolveUsername } from "@/features/profile/data";
import { ProfileLibraryView } from "@/features/profile/views/profile-library-view";
import { Loader } from "@/shared/components/loader";

export default async function Page({ params }: { params: Promise<{ username: string }> }) {
  const username = resolveUsername((await params).username);

  return (
    <Suspense fallback={<Loader />}>
      <ProfileLibraryView username={username} mediaType="ANIME" />
    </Suspense>
  );
}
