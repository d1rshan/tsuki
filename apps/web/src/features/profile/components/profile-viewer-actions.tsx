import type { UserOverview } from "@tsuki/api/types";

import { getSession } from "@/shared/lib/session";

import { EditProfileDialog } from "./edit-profile-dialog";
import { ProfileFollowButton } from "./profile-follow-button";
import { ProfilePrivacyToggle } from "./profile-privacy-toggle";
import { getProfileViewerRelationship } from "../data";

export async function ProfileViewerActions({
  profile,
  user: profileUser,
  isPrivate,
}: {
  profile: UserOverview["profile"];
  user: UserOverview["user"];
  isPrivate: boolean;
}) {
  const { user } = await getSession();
  if (user?.id === profileUser.id) {
    return (
      <div className="flex items-center gap-2">
        <ProfilePrivacyToggle initialValue={isPrivate} />
        <EditProfileDialog profile={profile} avatarImage={profileUser.image} />
      </div>
    );
  }
  // Logged-out visitors get no follow affordance — members-only, per public social design.
  if (!user) return null;

  const relationship = await getProfileViewerRelationship(profileUser.username);
  return (
    <ProfileFollowButton
      key={profileUser.username}
      initialRelationship={relationship}
      username={profileUser.username}
      isPrivate={isPrivate}
    />
  );
}
