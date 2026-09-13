import { Suspense } from "react";
import { notFound } from "next/navigation";

import { Skeleton } from "@/shared/components/ui/skeleton";

import { getProfileOverview, resolveUsername } from "../data";
import { ProfileAvatar } from "./profile-avatar";
import { ProfileBanner } from "./profile-banner";
import { ProfileTabs } from "./profile-tabs";
import { ProfileViewerActions } from "./profile-viewer-actions";

/**
 * Tabs depend only on the URL, so they paint synchronously; the data islands
 * (banner, identity, actions) stream in on their own boundaries. Each island
 * awaits route params itself so the header shell never suspends as a whole.
 */
export function ProfileHeaderShell({ params }: { params: Promise<{ username: string }> }) {
  return (
    <header className="mb-8">
      <Suspense fallback={<Skeleton className="mb-6 h-48 w-full rounded-2xl @min-[48rem]:h-64" />}>
        <HeaderBanner params={params} />
      </Suspense>

      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3 px-2 @min-[48rem]:px-6">
        <div className="flex min-w-0 flex-wrap items-start gap-x-6 gap-y-3">
          <Suspense fallback={<IdentitySkeleton />}>
            <HeaderIdentity params={params} />
          </Suspense>
        </div>

        <div className="shrink-0 pt-3">
          <Suspense fallback={null}>
            <HeaderActions params={params} />
          </Suspense>
        </div>
      </div>

      <div className="mt-4">
        <ProfileTabs />
      </div>
    </header>
  );
}

async function HeaderBanner({ params }: { params: Promise<{ username: string }> }) {
  const username = resolveUsername((await params).username);
  const profile = await getProfileOverview(username);
  if (!profile) notFound();

  return <ProfileBanner bannerImage={profile.profile?.bannerImage} />;
}

async function HeaderIdentity({ params }: { params: Promise<{ username: string }> }) {
  const username = resolveUsername((await params).username);
  const profile = await getProfileOverview(username);
  if (!profile) notFound();
  const user = profile.user;

  return (
    <div className="-mt-16 flex min-w-0 shrink-0 items-end gap-3 @min-[48rem]:-mt-20 @min-[48rem]:gap-4">
      <ProfileAvatar user={user} />
      <h1 className="min-w-0 truncate pb-1 text-lg font-bold tracking-tight text-foreground @min-[48rem]:pb-2 @min-[48rem]:text-xl">
        @{user.displayUsername || user.username}
      </h1>
    </div>
  );
}

function IdentitySkeleton() {
  return (
    <div
      className="-mt-16 flex shrink-0 items-end gap-3 @min-[48rem]:-mt-20 @min-[48rem]:gap-4"
      aria-hidden
    >
      <Skeleton className="h-24 w-24 rounded-full @min-[48rem]:h-32 @min-[48rem]:w-32" />
      <Skeleton className="mb-1 h-6 w-32 @min-[48rem]:mb-2" />
    </div>
  );
}

async function HeaderActions({ params }: { params: Promise<{ username: string }> }) {
  const username = resolveUsername((await params).username);
  const profile = await getProfileOverview(username);
  if (!profile) notFound();

  return <ProfileViewerActions profile={profile.profile} user={profile.user} />;
}
