import { notFound } from "next/navigation";

import { ProfileCard } from "@/features/social/components/profile-card";
import { ContentState } from "@/shared/components/content-state";
import { getSession } from "@/shared/lib/session";

import { FollowRequests } from "../components/follow-requests";
import { ProfileFilterLayout } from "../components/profile-filter-layout";
import type { ProfileFilterOption } from "../components/profile-filter-tabs";
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
        {list.users.length === 0 ? (
          <ContentState
            title={
              selected === "following"
                ? "This user is not following anyone yet"
                : "No followers yet"
            }
          />
        ) : (
          <ul className="grid grid-cols-2 gap-x-3 gap-y-6 @min-[40rem]:grid-cols-3 @min-[48rem]:grid-cols-4 @min-[64rem]:grid-cols-5">
            {list.users.map((user) => (
              <li key={user.id}>
                <ProfileCard user={user} />
              </li>
            ))}
          </ul>
        )}
      </ProfileFilterLayout>
    </div>
  );
}
