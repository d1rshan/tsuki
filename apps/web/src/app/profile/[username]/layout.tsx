import { notFound } from "next/navigation";

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
  const { data: profile, error } = await getProfileOverview(username);

  if (error) return notFound();

  const { user: currentUser } = await auth();

  const customStyle = profile?.profile?.accentColor
    ? ({ "--primary": profile.profile.accentColor } as React.CSSProperties)
    : {};

  return (
    <div className="min-h-screen pt-20 pb-10 md:pt-28 md:pb-16" style={customStyle}>
      <div className="max-w-5xl mx-auto px-4 md:px-6">
        <ProfileHeader
          user={profile.user}
          stats={profile.stats}
          profile={profile.profile}
          isOwner={currentUser?.id === profile.user.id}
        />
        {children}
      </div>
    </div>
  );
}
