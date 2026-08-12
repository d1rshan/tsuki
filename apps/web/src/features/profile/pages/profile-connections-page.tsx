import { Suspense } from "react";
import { notFound } from "next/navigation";

import { ProfileUserList } from "@/features/profile/components/profile-user-list";
import { LoadingIndicator } from "@/shared/components/loading-indicator";
import { parseUsername } from "@/shared/lib/username";

import { getProfileFollowers, getProfileFollowing } from "../data";

type ConnectionType = "followers" | "following";

export function ProfileConnectionsPage({
  params,
  type,
}: {
  params: Promise<{ username: string }>;
  type: ConnectionType;
}) {
  return (
    <Suspense fallback={<LoadingIndicator label={`Loading ${type}`} />}>
      <ProfileConnectionsContent params={params} type={type} />
    </Suspense>
  );
}

async function ProfileConnectionsContent({
  params,
  type,
}: {
  params: Promise<{ username: string }>;
  type: ConnectionType;
}) {
  const username = parseUsername((await params).username);
  if (!username) notFound();

  const users =
    type === "followers"
      ? await getProfileFollowers(username)
      : await getProfileFollowing(username);
  if (!users) notFound();

  return (
    <section aria-labelledby="connections-heading">
      <h2 id="connections-heading" className="mb-6 text-2xl font-bold tracking-tight capitalize">
        {type}
      </h2>
      <ProfileUserList
        users={users}
        emptyMessage={
          type === "followers" ? "No followers yet" : "This user is not following anyone yet"
        }
      />
    </section>
  );
}
