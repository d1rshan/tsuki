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

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ username: string }>;
}) {
  const username = parseProfileUsername((await params).username);
  if (!username) notFound();

  return <ProfileLayout username={username}>{children}</ProfileLayout>;
}
