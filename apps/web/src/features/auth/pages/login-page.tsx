import { redirect } from "next/navigation";

import { getSession } from "@/shared/lib/session";

import { LoginCard } from "../components/login-card";
import { SignUpCard } from "../components/signup-card";

export async function LoginPage({ searchParams }: { searchParams: Promise<{ mode?: string }> }) {
  const { user } = await getSession();
  if (user) redirect("/");

  const { mode } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center px-4 pt-20">
      {mode === "signup" ? <SignUpCard /> : <LoginCard />}
    </div>
  );
}
