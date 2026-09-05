import { Suspense } from "react";
import { notFound } from "next/navigation";

import { ProfileHeader } from "@/features/profile/components/profile-header";

import { ProfileViewerActions } from "../components/profile-viewer-actions";
import { getProfileOverview, resolveUsername } from "../data";

export async function ProfileLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ username: string }>;
}) {
  const username = resolveUsername((await params).username);
  const profile = await getProfileOverview(username);
  if (!profile) notFound();

  return (
    <div className="min-h-screen pt-20 pb-10 md:pt-28 md:pb-16">
      <ProfileHeader
        user={profile.user}
        profile={profile.profile}
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
