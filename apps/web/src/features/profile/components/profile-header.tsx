import { Suspense } from "react";
import { notFound } from "next/navigation";

import { getProfileIdentity, getProfileOverview, resolveUsername } from "../data";
import { ProfileAvatar } from "./profile-avatar";
import { ProfileBanner } from "./profile-banner";
import { ProfileTabs } from "./profile-tabs";
import { ProfileViewerActions } from "./profile-viewer-actions";

export function ProfileHeaderShell({ params }: { params: Promise<{ username: string }> }) {
  return (
    <header className="mb-8 @min-[48rem]:mb-10">
      <Suspense fallback={null}>
        <HeaderIdentity params={params} />
      </Suspense>
      <Suspense fallback={null}>
        <ProfileTabs />
      </Suspense>
    </header>
  );
}

async function HeaderIdentity({ params }: { params: Promise<{ username: string }> }) {
  const username = resolveUsername((await params).username);
  const identity = await getProfileIdentity(username);
  if (!identity) notFound();

  const { user } = identity;
  const handle = user.displayUsername.trim();

  return (
    <div className="grid grid-cols-[9.5rem_minmax(0,1fr)] gap-2 rounded-2xl bg-muted p-2 @min-[48rem]:grid-cols-[11rem_minmax(0,1fr)] @min-[48rem]:gap-3 @min-[48rem]:p-3">
      <div className="flex min-w-0 flex-col items-center justify-center gap-2 px-2 py-3 @min-[48rem]:px-4">
        <ProfileAvatar user={user} />
        <h1 className="w-full min-w-0 text-center text-base font-medium tracking-tight text-foreground @min-[48rem]:text-lg">
          <span className="block truncate">{handle}</span>
        </h1>
        <div className="mt-1 flex min-h-11 max-w-full items-center justify-center">
          <Suspense fallback={null}>
            <HeaderActions params={params} />
          </Suspense>
        </div>
      </div>
      <HeaderBanner username={username} identity={identity} />
    </div>
  );
}

function HeaderBanner({
  username,
  identity,
}: {
  username: string;
  identity: NonNullable<Awaited<ReturnType<typeof getProfileIdentity>>>;
}) {
  const banner = <ProfileBanner bannerImage={identity.bannerImage} />;
  if (!identity.isPrivate) return banner;

  return (
    <Suspense fallback={banner}>
      <PrivateBanner username={username} />
    </Suspense>
  );
}

async function PrivateBanner({ username }: { username: string }) {
  const overview = await getProfileOverview(username);
  return <ProfileBanner bannerImage={overview?.profile?.bannerImage} />;
}

async function HeaderActions({ params }: { params: Promise<{ username: string }> }) {
  const username = resolveUsername((await params).username);
  const overview = await getProfileOverview(username);
  if (!overview) notFound();

  return (
    <ProfileViewerActions
      profile={overview.profile}
      user={overview.user}
      isPrivate={overview.isPrivate}
    />
  );
}
