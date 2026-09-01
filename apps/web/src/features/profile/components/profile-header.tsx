import type { UserOverview } from "@tsuki/api/types";

import { ProfileAvatar } from "./profile-avatar";
import { ProfileBanner } from "./profile-banner";
import { ProfileTabs } from "./profile-tabs";

type ProfileHeaderProps = {
  actions: React.ReactNode;
  isOwner?: boolean;
  profile: UserOverview["profile"];
  user: UserOverview["user"];
};

export function ProfileHeader({ actions, isOwner = false, profile, user }: ProfileHeaderProps) {
  return (
    <header className="mb-8">
      <ProfileBanner bannerImage={profile?.bannerImage} isOwner={isOwner} />

      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3 px-2 md:px-6">
        <div className="flex min-w-0 flex-wrap items-start gap-x-6 gap-y-3">
          <div className="-mt-16 flex shrink-0 flex-col items-center gap-2 md:-mt-20">
            <ProfileAvatar user={user} isOwner={isOwner} />
            <h1 className="truncate text-lg font-bold tracking-tight text-foreground md:text-xl">
              @{user.displayUsername || user.username}
            </h1>
          </div>

          <div className="min-w-0 max-w-full pt-3">
            <ProfileTabs username={user.username} />
          </div>
        </div>

        <div className="shrink-0 pt-3">{actions}</div>
      </div>
    </header>
  );
}
