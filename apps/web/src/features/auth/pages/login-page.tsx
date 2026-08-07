import { Suspense } from "react";
import { redirect } from "next/navigation";

import { getSession } from "@/shared/lib/session";
import { LoadingIndicator } from "@/shared/components/loading-indicator";

import { LoginCard } from "../components/login-card";
import { SignUpCard } from "../components/signup-card";

export function LoginPage({ searchParams }: { searchParams: Promise<{ mode?: string }> }) {
  return (
    <Suspense fallback={<LoadingIndicator className="min-h-screen" label="Loading sign in" />}>
      <LoginPageContent searchParams={searchParams} />
    </Suspense>
  );
}

async function LoginPageContent({ searchParams }: { searchParams: Promise<{ mode?: string }> }) {
  const { user } = await getSession();
  if (user) redirect("/");

  const { mode } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center px-4 pt-20">
      {mode === "signup" ? <SignUpCard /> : <LoginCard />}
    </div>
  );
}
