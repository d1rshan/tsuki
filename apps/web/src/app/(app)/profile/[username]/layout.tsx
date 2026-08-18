import type { Metadata } from "next";

import { ProfileLayout, getProfileMetadata } from "@/features/profile/layouts/profile-layout";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  return getProfileMetadata(username);
}

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  return <ProfileLayout username={username}>{children}</ProfileLayout>;
}
