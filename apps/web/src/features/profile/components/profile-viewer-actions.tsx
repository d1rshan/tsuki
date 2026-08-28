import type { UserOverview } from "@tsuki/api/types";

import { getSession } from "@/shared/lib/session";

import { EditProfileDialog } from "./edit-profile-dialog";
import { ProfileFollowButton } from "./profile-follow-button";
import { getProfileViewerRelationship } from "../data";

export async function ProfileViewerActions({
  profile,
  user: profileUser,
}: {
  profile: UserOverview["profile"];
  user: UserOverview["user"];
}) {
  const { user } = await getSession();
  if (user?.id === profileUser.id) {
    return <EditProfileDialog profile={profile} user={profileUser} />;
  }

  const relationship = user ? await getProfileViewerRelationship(profileUser.username) : null;
  return (
    <ProfileFollowButton
      key={profileUser.username}
      initialRelationship={relationship}
      isAuthenticated={Boolean(user)}
      username={profileUser.username}
    />
  );
}
