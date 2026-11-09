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
      <Suspense fallback={<HeaderIdentityFallback />}>
        <HeaderIdentity params={params} />
      </Suspense>
      <Suspense fallback={<div aria-hidden="true" className="mt-4 h-10.5 rounded-xl bg-muted" />}>
        <ProfileTabs />
      </Suspense>
    </header>
  );
}

function IdentityRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative z-10 -mt-12 flex min-w-0 items-end gap-4 @min-[48rem]:-mt-16 @min-[48rem]:gap-6">
      {children}
    </div>
  );
}

function HeaderIdentityFallback() {
  return (
    <>
      <ProfileBanner />
      <IdentityRow>
        <Skeleton className="size-24 shrink-0 rounded-full ring-4 ring-background @min-[48rem]:size-32" />
        <Skeleton className="mb-3 h-6 w-32 @min-[48rem]:mb-4" />
      </IdentityRow>
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
      <HeaderBanner username={username} identity={identity} />
      <IdentityRow>
        <ProfileAvatar
          user={user}
          className="size-24 ring-4 ring-background @min-[48rem]:size-32"
        />
        <div className="flex min-w-0 flex-1 flex-wrap items-center justify-between gap-x-4 gap-y-2 pb-2 @min-[48rem]:pb-4">
          <h1 className="min-w-0 truncate text-xl font-semibold tracking-tight @min-[48rem]:text-3xl">
            {handle}
          </h1>
          <Suspense fallback={null}>
            <HeaderActions params={params} />
          </Suspense>
        </div>
      </IdentityRow>
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
