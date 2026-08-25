import { Suspense } from "react";

import { resolveUsername } from "@/features/profile/data";
import { parseConnectionPage } from "@/features/profile/utils";
import { ProfileConnectionsView } from "@/features/profile/views/profile-connections-view";
import { Loader } from "@/shared/components/loader";

export default function Page({
  params,
  searchParams,
}: {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  return (
    <Suspense fallback={<Loader />}>
      <FollowingContent params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function FollowingContent({
  params,
  searchParams,
}: {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const [{ username }, { page }] = await Promise.all([params, searchParams]);

  return (
    <ProfileConnectionsView
      type="following"
      username={resolveUsername(username)}
      page={parseConnectionPage(page)}
    />
  );
}
