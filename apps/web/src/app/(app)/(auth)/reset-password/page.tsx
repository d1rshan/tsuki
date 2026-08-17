import type { Metadata } from "next";

import { ResetPasswordView } from "@/features/auth/views/reset-password-view";

export const metadata: Metadata = { title: "Choose a new password" };

export const instant = false;

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return <ResetPasswordView token={token} />;
}
