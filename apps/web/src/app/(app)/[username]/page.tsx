import { Suspense } from "react";

import { resolveUsername } from "@/features/profile/data";
import { ProfileOverviewView } from "@/features/profile/views/profile-overview-view";
import { Loader } from "@/shared/components/loader";

export default async function Page({ params }: { params: Promise<{ username: string }> }) {
  const username = resolveUsername((await params).username);

  return (
    <Suspense fallback={<Loader />}>
      <ProfileOverviewView username={username} />
    </Suspense>
  );
}
