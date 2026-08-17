import { Suspense } from "react";
import { notFound } from "next/navigation";

import { ProfileUserList } from "@/features/profile/components/profile-user-list";
import { ProfileConnectionsPagination } from "@/features/profile/components/profile-connections-pagination";
import { LoadingIndicator } from "@/shared/components/loading-indicator";
import { parseUsername } from "@/shared/lib/username";

import { getProfileFollowers, getProfileFollowing } from "../data";

type ConnectionType = "followers" | "following";
const PAGE_SIZE = 40;

export function ProfileConnectionsPage({
  params,
  searchParams,
  type,
}: {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ page?: string }>;
  type: ConnectionType;
}) {
  return (
    <Suspense fallback={<LoadingIndicator label={`Loading ${type}`} />}>
      <ProfileConnectionsContent params={params} searchParams={searchParams} type={type} />
    </Suspense>
  );
}

async function ProfileConnectionsContent({
  params,
  searchParams,
  type,
}: {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ page?: string }>;
  type: ConnectionType;
}) {
  const [{ username: rawUsername }, { page: rawPage }] = await Promise.all([params, searchParams]);
  const username = parseUsername(rawUsername);
  if (!username) notFound();

  const parsedPage = Number(rawPage ?? 1);
  const page = Number.isSafeInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const result =
    type === "followers"
      ? await getProfileFollowers(username, PAGE_SIZE, (page - 1) * PAGE_SIZE)
      : await getProfileFollowing(username, PAGE_SIZE, (page - 1) * PAGE_SIZE);
  if (!result) notFound();

  const pageCount = Math.max(1, Math.ceil(result.total / PAGE_SIZE));
  if (page > pageCount) notFound();

  return (
    <section aria-labelledby="connections-heading">
      <h2 id="connections-heading" className="mb-6 text-2xl font-bold tracking-tight capitalize">
        {type}
      </h2>
      <ProfileUserList
        users={result.users}
        emptyMessage={
          type === "followers" ? "No followers yet" : "This user is not following anyone yet"
        }
      />
      <ProfileConnectionsPagination pageCount={pageCount} />
    </section>
  );
}
