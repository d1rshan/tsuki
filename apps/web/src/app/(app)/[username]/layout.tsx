import type { Metadata } from "next";

import { getProfileMetadata, resolveUsername } from "@/features/profile/data";
import { ProfileLayout } from "@/features/profile/layouts/profile-layout";

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
  return <ProfileLayout params={params}>{children}</ProfileLayout>;
}
