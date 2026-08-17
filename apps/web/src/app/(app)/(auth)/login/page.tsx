import type { Metadata } from "next";

import { LoginView } from "@/features/auth/views/login-view";

export const metadata: Metadata = { title: "Sign in" };

export const instant = false;

export default async function Page({ searchParams }: { searchParams: Promise<{ mode?: string }> }) {
  const { mode } = await searchParams;

  return <LoginView mode={mode} />;
}
