import { notFound } from "next/navigation";
import { Suspense } from "react";

import { ProfileHeader } from "@/components/profile/profile-header";
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
    <div className="min-h-screen py-10 md:py-16">
      <div className="max-w-5xl mx-auto px-4 md:px-6">
        <Suspense
          fallback={
            <div className="h-64 md:h-80 w-full flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          }
        >
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
