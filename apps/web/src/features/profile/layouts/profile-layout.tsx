import { Suspense } from "react";
import { notFound } from "next/navigation";

import { ProfileHeader } from "@/features/profile/components/profile-header";

import { ProfileViewerActions } from "../components/profile-viewer-actions";
import { getProfileOverview } from "../data";

export async function ProfileLayout({
  children,
  username,
}: {
  children: React.ReactNode;
  username: string;
}) {
  const profile = await getProfileOverview(username);
  if (!profile) notFound();

  return (
    <div className="min-h-screen pt-20 pb-10 md:pt-28 md:pb-16">
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
  );
}
