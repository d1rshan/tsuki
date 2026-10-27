import { Suspense } from "react";

import { Loader } from "@/shared/components/loader";

import { getProfileOverview, resolveUsername } from "../data";
import { ProfileHeaderShell } from "../components/profile-header";

export function ProfileLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ username: string }>;
}) {
  return (
    <div className="min-h-screen pt-20 pb-12 md:pt-28 md:pb-16">
      <ProfileHeaderShell params={params} />
      <Suspense fallback={<Loader />}>
        <ProfileContent params={params}>{children}</ProfileContent>
      </Suspense>
    </div>
  );
}

async function ProfileContent({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ username: string }>;
}) {
  const profile = await getProfileOverview(resolveUsername((await params).username));
  if (profile?.locked)
    return (
      <div className="mx-auto max-w-xl rounded-xl border p-10 text-center">
        <h2 className="text-xl font-semibold">This profile is private</h2>
        <p className="mt-2 text-muted-foreground">Follow this user to see their profile.</p>
      </div>
    );
  return <>{children}</>;
}
