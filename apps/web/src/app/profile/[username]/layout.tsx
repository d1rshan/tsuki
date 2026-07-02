import { notFound } from "next/navigation";
import { Suspense } from "react";

import { ProfileHeader } from "@/components/profile/profile-header";
import { ProfileHeaderSkeleton } from "@/components/profile/profile-skeletons";
import { auth } from "@/lib/auth";

import { getProfileOverview } from "./queries";

export default async function ProfileLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  return (
    <div className="min-h-screen pt-20 pb-10 md:pt-28 md:pb-16">
      <div className="max-w-5xl mx-auto px-4 md:px-6">
        <Suspense fallback={<ProfileHeaderSkeleton />}>
          <ProfileHeaderWrapper username={username} />
        </Suspense>

        {children}
      </div>
    </div>
  );
}

async function ProfileHeaderWrapper({ username }: { username: string }) {
  const { data: profile, error } = await getProfileOverview(username);
  const { user: currentUser } = await auth();

  if (error) return notFound();

  return (
    <ProfileHeader
      user={profile.user}
      stats={profile.stats}
      profile={profile.profile}
      isOwner={currentUser?.id === profile.user.id}
    />
  );
}
