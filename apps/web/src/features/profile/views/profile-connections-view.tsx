import { notFound } from "next/navigation";

import { ProfileUserList } from "@/features/profile/components/profile-user-list";
import { ProfileConnectionsPagination } from "@/features/profile/components/profile-connections-pagination";

import { getProfileFollowers, getProfileFollowing } from "../data";

const PAGE_SIZE = 40;

export async function ProfileConnectionsView({
  page,
  type,
  username,
}: {
  page: number;
  type: "followers" | "following";
  username: string;
}) {
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
