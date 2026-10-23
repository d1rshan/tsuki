import { Suspense } from "react";
import { notFound } from "next/navigation";

import { getProfileOverview, resolveUsername } from "../data";
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
        <HeaderTabs params={params} />
      </Suspense>
    </header>
  );
}

async function HeaderTabs({ params }: { params: Promise<{ username: string }> }) {
  const username = resolveUsername((await params).username);
  const overview = await getProfileOverview(username);
  return overview && !overview.locked ? <ProfileTabs /> : null;
}

async function HeaderIdentity({ params }: { params: Promise<{ username: string }> }) {
  const username = resolveUsername((await params).username);
  const overview = await getProfileOverview(username);
  if (!overview) notFound();

  const { user } = overview;
  const handle = user.displayUsername.trim();

  return (
    <ProfileBanner bannerImage={overview.profile?.bannerImage}>
      <div className="relative flex w-full items-end gap-3 p-4 @min-[48rem]:gap-4 @min-[48rem]:p-5">
        <ProfileAvatar user={user} />
        <h1 className="mb-1 flex h-9 min-w-0 flex-1 items-center text-lg font-medium tracking-tight text-foreground @min-[48rem]:text-xl">
          <span className="truncate">{handle}</span>
        </h1>
        <div className="mb-1 shrink-0 empty:hidden">
          <Suspense fallback={null}>
            <HeaderActions params={params} />
          </Suspense>
        </div>
      </div>
    </ProfileBanner>
  );
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
