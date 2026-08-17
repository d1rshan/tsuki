import type { Metadata } from "next";

import { ProfileLayout, getProfileMetadata } from "@/features/profile/layouts/profile-layout";

export function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  return getProfileMetadata({ params });
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
