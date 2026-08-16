import type { Metadata } from "next";

import { VerifyEmailView } from "@/features/auth/views/verify-email-view";

export const metadata: Metadata = { title: "Verify your email" };

export const instant = false;

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;

  return <VerifyEmailView email={email} />;
}
