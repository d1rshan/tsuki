import { notFound } from "next/navigation";

import { getSession } from "@/shared/lib/session";

import { ProfileFilterLayout } from "../components/profile-filter-layout";
import { FollowRequests } from "../components/follow-requests";
import type { ProfileFilterOption } from "../components/profile-filter-tabs";
import { ProfileUserList } from "../components/profile-user-list";
import { getProfileFollowers, getProfileFollowing, getProfileOverview } from "../data";
import { searchParam, type ProfileSearchParams } from "../utils";

// ponytail: one page of 100 per list, no pagination — add ?page per section if a list outgrows it
const LIMIT = 100;

export async function ProfileSocialView({
  searchParams,
  username,
}: {
  searchParams: Promise<ProfileSearchParams>;
  username: string;
}) {
  const profile = await getProfileOverview(username);
  if (profile?.locked) return null;
  const [followers, following, params, session] = await Promise.all([
    getProfileFollowers(username, LIMIT, 0),
    getProfileFollowing(username, LIMIT, 0),
    searchParams,
    getSession(),
  ]);
  if (!followers || !following) notFound();

  const selected = searchParam(params, "list") === "following" ? "following" : "followers";
  const list = selected === "following" ? following : followers;

  const options: ProfileFilterOption[] = [
    { value: "followers", label: "Followers", href: `/${username}/social`, count: followers.total },
    {
      value: "following",
      label: "Following",
      href: `/${username}/social?list=following`,
      count: following.total,
    },
  ];

  return (
    <div>
      {session.user?.username === username && <FollowRequests />}
      <ProfileFilterLayout label="Social list" options={options} selected={selected}>
        <ProfileUserList
          users={list.users}
          emptyMessage={
            selected === "following" ? "This user is not following anyone yet" : "No followers yet"
          }
        />
      </ProfileFilterLayout>
    </div>
  );
}
