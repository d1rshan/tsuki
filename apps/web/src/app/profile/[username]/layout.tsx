import { notFound } from "next/navigation";

import { ProfileHeader } from "@/modules/profile/components/profile-header";
import { auth } from "@/lib/auth";
import { getProfileOverview } from "@/modules/profile/queries";

export default async function ProfileLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const { data, error } = await getProfileOverview(username);

  if (error || !data) return notFound();

  const { user: currentUser } = await auth();

  const customStyle = data.profile?.accentColor
    ? ({ "--primary": data.profile.accentColor } as React.CSSProperties)
    : {};

  return (
    <div className="min-h-screen pt-20 pb-10 md:pt-28 md:pb-16" style={customStyle}>
      <div className="max-w-5xl mx-auto px-4 md:px-6">
        <ProfileHeader
          user={data.user}
          stats={data.stats}
          profile={data.profile}
          isOwner={currentUser?.id === data.user.id}
        />
        {children}
      </div>
    </div>
  );
}
