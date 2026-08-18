import type { Metadata } from "next";

import { ProfileLayout, getProfileMetadata } from "@/features/profile/layouts/profile-layout";
import { requireValidUsername } from "@/features/profile/valid";

export const instant = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  return getProfileMetadata(await requireValidUsername(params));
}

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ username: string }>;
}) {
  const username = await requireValidUsername(params);
  return <ProfileLayout username={username}>{children}</ProfileLayout>;
}
