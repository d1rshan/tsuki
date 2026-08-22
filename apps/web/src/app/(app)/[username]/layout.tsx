import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { ProfileLayout, getProfileMetadata } from "@/features/profile/layouts/profile-layout";
import { parseProfileUsername } from "@/features/profile/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const username = parseProfileUsername((await params).username);
  if (!username) notFound();

  return getProfileMetadata(username);
}

type ProfileLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ username: string }>;
};

export default function Layout(props: ProfileLayoutProps) {
  return (
    <Suspense fallback={null}>
      <ProfileLayoutContent {...props} />
    </Suspense>
  );
}

async function ProfileLayoutContent({ children, params }: ProfileLayoutProps) {
  const username = parseProfileUsername((await params).username);
  if (!username) notFound();

  return <ProfileLayout username={username}>{children}</ProfileLayout>;
}
