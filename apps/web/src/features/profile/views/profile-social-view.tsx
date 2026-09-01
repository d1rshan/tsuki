import { notFound } from "next/navigation";

import { ProfileUserList } from "@/features/profile/components/profile-user-list";
import { ProfileSection } from "@/features/profile/components/profile-section";

import { getProfileFollowers, getProfileFollowing } from "../data";

// ponytail: one page of 100 per list, no pagination — add ?page per section if a list outgrows it
const LIMIT = 100;

export async function ProfileSocialView({ username }: { username: string }) {
  const [followers, following] = await Promise.all([
    getProfileFollowers(username, LIMIT, 0),
    getProfileFollowing(username, LIMIT, 0),
  ]);
  if (!followers || !following) notFound();

  return (
    <div className="space-y-16 pb-16">
      <ProfileSection title="Followers" count={followers.total}>
        <ProfileUserList users={followers.users} emptyMessage="No followers yet" />
      </ProfileSection>

      <ProfileSection title="Following" count={following.total}>
        <ProfileUserList
          users={following.users}
          emptyMessage="This user is not following anyone yet"
        />
      </ProfileSection>
    </div>
  );
}
