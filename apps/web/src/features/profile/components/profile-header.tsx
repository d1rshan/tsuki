import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";

import { Skeleton } from "@/shared/components/ui/skeleton";

import { getProfileOverview, resolveUsername } from "../data";
import { ProfileAvatar } from "./profile-avatar";
import { ProfileBanner } from "./profile-banner";
import { ProfileTabs } from "./profile-tabs";
import { ProfileViewerActions } from "./profile-viewer-actions";

/**
 * The profile "plate": cover, identity and actions share one clipped surface so
 * they read as a single object, then the tab rail sticks beneath it. The data
 * islands await route params themselves, so the plate frame never suspends.
 */
export function ProfileHeaderShell({ params }: { params: Promise<{ username: string }> }) {
  return (
    <header className="mb-6 @min-[48rem]:mb-8">
      <div className="overflow-hidden rounded-3xl border border-border/60 bg-card shadow-sm">
        <Suspense
          fallback={
            <Skeleton className="h-32 w-full rounded-none @min-[48rem]:h-48 @min-[64rem]:h-56" />
          }
        >
          <HeaderCover params={params} />
        </Suspense>

        <div className="flex flex-wrap items-end gap-x-5 gap-y-4 px-5 pb-5 @min-[48rem]:px-7 @min-[48rem]:pb-7">
          <Suspense fallback={<IdentitySkeleton />}>
            <HeaderIdentity params={params} />
          </Suspense>

          <div className="w-full empty:hidden @min-[48rem]:w-auto [&_button]:w-full @min-[48rem]:[&_button]:w-auto">
            <Suspense fallback={null}>
              <HeaderActions params={params} />
            </Suspense>
          </div>
        </div>
      </div>

      <ProfileTabs />
    </header>
  );
}

async function HeaderCover({ params }: { params: Promise<{ username: string }> }) {
  const username = resolveUsername((await params).username);
  const overview = await getProfileOverview(username);
  if (!overview) notFound();

  return <ProfileBanner bannerImage={overview.profile?.bannerImage} />;
}

async function HeaderIdentity({ params }: { params: Promise<{ username: string }> }) {
  const username = resolveUsername((await params).username);
  const overview = await getProfileOverview(username);
  if (!overview) notFound();

  const { user, social } = overview;
  const handle = user.displayUsername.trim();

  return (
    <>
      <ProfileAvatar user={user} className="-mt-10 @min-[48rem]:-mt-14" />
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-xl font-bold tracking-tight @min-[48rem]:text-2xl">
          {handle}
        </h1>
        <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
          <time dateTime={new Date(user.createdAt).toISOString()}>
            Joined {format(new Date(user.createdAt), "MMMM yyyy")}
          </time>
          <Link href={`/${handle}/social`} className="transition-colors hover:text-foreground">
            <span className="font-mono tabular-nums">{social.followers}</span>{" "}
            {social.followers === 1 ? "Follower" : "Followers"}
          </Link>
          <Link
            href={`/${handle}/social?list=following`}
            className="transition-colors hover:text-foreground"
          >
            <span className="font-mono tabular-nums">{social.following}</span> Following
          </Link>
        </p>
      </div>
    </>
  );
}

function IdentitySkeleton() {
  return (
    <>
      <Skeleton
        className="-mt-10 size-20 shrink-0 rounded-full ring-4 ring-card @min-[48rem]:-mt-14 @min-[48rem]:size-28"
        aria-hidden
      />
      <div className="flex-1" aria-hidden>
        <Skeleton className="h-6 w-40 @min-[48rem]:h-7 @min-[48rem]:w-48" />
        <Skeleton className="mt-2 h-3 w-56" />
      </div>
    </>
  );
}

async function HeaderActions({ params }: { params: Promise<{ username: string }> }) {
  const username = resolveUsername((await params).username);
  const overview = await getProfileOverview(username);
  if (!overview) notFound();

  return <ProfileViewerActions profile={overview.profile} user={overview.user} />;
}
