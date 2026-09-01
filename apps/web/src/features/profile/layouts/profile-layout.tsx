import { Suspense } from "react";
import { notFound } from "next/navigation";

import { ProfileHeader } from "@/features/profile/components/profile-header";
import { getSession } from "@/shared/lib/session";

import { ProfileViewerActions } from "../components/profile-viewer-actions";
import { getProfileOverview } from "../data";

export async function ProfileLayout({
  children,
  username,
}: {
  children: React.ReactNode;
  username: string;
}) {
  const [profile, { user: sessionUser }] = await Promise.all([
    getProfileOverview(username),
    getSession(),
  ]);
  if (!profile) notFound();

  const isOwner = sessionUser?.id === profile.user.id;

  return (
    <div className="min-h-screen pt-20 pb-10 md:pt-28 md:pb-16">
      <ProfileHeader
        user={profile.user}
        profile={profile.profile}
        isOwner={isOwner}
        actions={
          <Suspense fallback={null}>
            <ProfileViewerActions profile={profile.profile} user={profile.user} />
          </Suspense>
        }
      />
      {children}
    </div>
  );
}
