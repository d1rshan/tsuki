import { Suspense } from "react";
import { notFound } from "next/navigation";

import { Skeleton } from "@/shared/components/ui/skeleton";

import { getProfileIdentity, getProfileOverview, resolveUsername } from "../data";
import { ProfileAvatar } from "./profile-avatar";
import { ProfileBanner } from "./profile-banner";
import { ProfileTabs } from "./profile-tabs";
import { ProfileViewerActions } from "./profile-viewer-actions";

export function ProfileHeaderShell({ params }: { params: Promise<{ username: string }> }) {
  return (
    <header className="mb-8 @min-[48rem]:mb-10">
      <div className="grid grid-cols-[9.5rem_minmax(0,1fr)] gap-2 rounded-2xl bg-muted p-2 @min-[48rem]:grid-cols-[11rem_minmax(0,1fr)] @min-[48rem]:gap-3 @min-[48rem]:p-3">
        <Suspense fallback={<HeaderIdentityFallback />}>
          <HeaderIdentity params={params} />
        </Suspense>
      </div>
      <Suspense fallback={<div aria-hidden="true" className="mt-4 h-10.5 rounded-xl bg-muted" />}>
        <ProfileTabs />
      </Suspense>
    </header>
  );
}

function IdentityColumn({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-44 min-w-0 flex-col items-center justify-center gap-2 px-2 py-3 @min-[48rem]:min-h-49 @min-[48rem]:px-4">
      {children}
    </div>
  );
}

function HeaderIdentityFallback() {
  return (
    <>
      <IdentityColumn>
        <Skeleton className="size-16 rounded-full bg-background/40 @min-[48rem]:size-20" />
        <div className="flex h-6 items-center @min-[48rem]:h-7" aria-hidden="true">
          <Skeleton className="h-4 w-20 bg-background/40" />
        </div>
        <div className="mt-1 min-h-11" aria-hidden="true" />
      </IdentityColumn>
      <ProfileBanner />
    </>
  );
}

async function HeaderIdentity({ params }: { params: Promise<{ username: string }> }) {
  const username = resolveUsername((await params).username);
  const identity = await getProfileIdentity(username);
  if (!identity) notFound();

  const { user } = identity;
  const handle = user.displayUsername.trim();

  return (
    <>
      <IdentityColumn>
        <ProfileAvatar user={user} />
        <h1 className="w-full min-w-0 text-center text-base font-medium tracking-tight text-foreground @min-[48rem]:text-lg">
          <span className="block truncate">{handle}</span>
        </h1>
        <div className="mt-1 flex min-h-11 max-w-full items-center justify-center empty:hidden">
          <Suspense fallback={null}>
            <HeaderActions params={params} />
          </Suspense>
        </div>
      </IdentityColumn>
      <HeaderBanner username={username} identity={identity} />
    </>
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
