import { Suspense } from "react";

import { ProfileHeaderShell } from "../components/profile-header";
import { ProfileHeaderSkeleton } from "../components/profile-header-skeleton";

export function ProfileLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ username: string }>;
}) {
  return (
    <div className="min-h-screen pt-20 pb-10 md:pt-28 md:pb-16">
      <Suspense fallback={<ProfileHeaderSkeleton />}>
        <ProfileHeaderShell params={params} />
      </Suspense>
      {children}
    </div>
  );
}
