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
      <FollowersContent params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function FollowersContent({
  params,
  searchParams,
}: {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const [{ username }, { page }] = await Promise.all([params, searchParams]);

  return (
    <ProfileConnectionsView
      type="followers"
      username={resolveUsername(username)}
      page={parseConnectionPage(page)}
    />
  );
}
