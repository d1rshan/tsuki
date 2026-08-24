import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { ProfileHeader } from "@/features/profile/components/profile-header";

import { ProfileViewerActions } from "../components/profile-viewer-actions";
import { getProfileOverview } from "../data";

type ProfileLayoutProps = {
  children: React.ReactNode;
  username: string;
};

export function ProfileLayout({ children, username }: ProfileLayoutProps) {
  return <ProfileLayoutContent username={username}>{children}</ProfileLayoutContent>;
}

async function ProfileLayoutContent({ children, username }: ProfileLayoutProps) {
  const profile = await getProfileOverview(username);
  if (!profile) notFound();

  return (
    <div className="min-h-screen pt-20 pb-10 md:pt-28 md:pb-16">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <ProfileHeader
          user={profile.user}
          stats={profile.stats}
          profile={profile.profile}
          social={profile.social}
          actions={
            <Suspense fallback={null}>
              <ProfileViewerActions profile={profile.profile} user={profile.user} />
            </Suspense>
          }
        />
        {children}
      </div>
    </div>
  );
}

export async function getProfileMetadata(username: string): Promise<Metadata> {
  const profile = await getProfileOverview(username);
  if (!profile) return { title: "Profile not found" };

  return {
    title: profile.user.displayUsername,
    description: profile.profile?.bio?.slice(0, 160) || `View @${profile.user.username} on Tsuki.`,
  };
}
