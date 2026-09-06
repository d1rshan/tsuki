import { Suspense } from "react";
import { notFound } from "next/navigation";

import { Skeleton } from "@/shared/components/ui/skeleton";

import { getProfileOverview, resolveUsername } from "../data";
import { ProfileAvatar } from "./profile-avatar";
import { ProfileBanner } from "./profile-banner";
import { ProfileTabs } from "./profile-tabs";
import { ProfileViewerActions } from "./profile-viewer-actions";

/**
 * Awaits only route params, so tabs paint immediately while the data
 * islands (banner, identity, actions) stream in on their own boundaries.
 */
export async function ProfileHeaderShell({ params }: { params: Promise<{ username: string }> }) {
  const username = resolveUsername((await params).username);

  return (
    <header className="mb-8">
      <Suspense fallback={<Skeleton className="mb-6 h-48 w-full rounded-2xl md:h-64" />}>
        <HeaderBanner username={username} />
      </Suspense>

      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3 px-2 md:px-6">
        <div className="flex min-w-0 flex-wrap items-start gap-x-6 gap-y-3">
          <Suspense fallback={<IdentitySkeleton />}>
            <HeaderIdentity username={username} />
          </Suspense>

          <div className="min-w-0 max-w-full pt-3">
            <ProfileTabs username={username} />
          </div>
        </div>

        <div className="shrink-0 pt-3">
          <Suspense fallback={null}>
            <HeaderActions username={username} />
          </Suspense>
        </div>
      </div>
    </header>
  );
}

async function HeaderBanner({ username }: { username: string }) {
  const profile = await getProfileOverview(username);
  if (!profile) notFound();

  return <ProfileBanner bannerImage={profile.profile?.bannerImage} />;
}

async function HeaderIdentity({ username }: { username: string }) {
  const profile = await getProfileOverview(username);
  if (!profile) notFound();
  const user = profile.user;

  return (
    <div className="-mt-16 flex shrink-0 flex-col items-center gap-2 md:-mt-20">
      <ProfileAvatar user={user} />
      <h1 className="truncate text-lg font-bold tracking-tight text-foreground md:text-xl">
        @{user.displayUsername || user.username}
      </h1>
    </div>
  );
}

function IdentitySkeleton() {
  return (
    <div className="-mt-16 flex shrink-0 flex-col items-center md:-mt-20" aria-hidden>
      <Skeleton className="h-24 w-24 rounded-full md:h-32 md:w-32" />
    </div>
  );
}

async function HeaderActions({ username }: { username: string }) {
  const profile = await getProfileOverview(username);
  if (!profile) notFound();

  return <ProfileViewerActions profile={profile.profile} user={profile.user} />;
}
