import { notFound } from "next/navigation";
import { Suspense } from "react";

import { ProfileTabs } from "@/components/profile/profile-tabs";
import { ProfileHeader } from "@/components/profile/profile-header";
import { ProfileHeaderSkeleton } from "@/components/profile/profile-skeletons";

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
    <div className="min-h-screen pt-24 pb-16 relative">
      <Suspense fallback={<ProfileHeaderSkeleton />}>
        <ProfileHeaderWrapper username={username} />
      </Suspense>
      <div className="max-w-5xl mx-auto px-4 md:px-6 relative z-10">
        <ProfileTabs />
        {children}
      </div>
    </div>
  );
}

async function ProfileHeaderWrapper({ username }: { username: string }) {
  const { data: profile, error } = await getProfileOverview(username);

  if (error) return notFound();

  return <ProfileHeader user={profile.user} stats={profile.stats} />;
}
