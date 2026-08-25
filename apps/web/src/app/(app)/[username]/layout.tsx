import { Suspense } from "react";

import { getProfileMetadata, resolveUsername } from "@/features/profile/data";
import { ProfileLayout } from "@/features/profile/layouts/profile-layout";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  return getProfileMetadata(resolveUsername((await params).username));
}

export default function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ username: string }>;
}) {
  return (
    <Suspense fallback={null}>
      <ProfileLayoutContent params={params}>{children}</ProfileLayoutContent>
    </Suspense>
  );
}

async function ProfileLayoutContent({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ username: string }>;
}) {
  const username = resolveUsername((await params).username);

  return <ProfileLayout username={username}>{children}</ProfileLayout>;
}
