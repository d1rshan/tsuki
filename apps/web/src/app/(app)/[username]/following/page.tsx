import { Suspense } from "react";
import { notFound } from "next/navigation";

import { ProfileConnectionsView } from "@/features/profile/views/profile-connections-view";
import { parseConnectionPage, parseProfileUsername } from "@/features/profile/utils";
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
  const [{ username: rawUsername }, { page: rawPage }] = await Promise.all([params, searchParams]);
  const username = parseProfileUsername(rawUsername);
  if (!username) notFound();

  return (
    <ProfileConnectionsView
      username={username}
      page={parseConnectionPage(rawPage)}
      type="following"
    />
  );
}
