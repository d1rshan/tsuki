import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

import { LoginCard } from "@/modules/auth/components/login-card";
import { SignUpCard } from "@/modules/auth/components/signup-card";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string }>;
}) {
  const { user } = await auth();

  if (user) {
    redirect("/");
  }

  const { mode } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      {mode === "signup" ? <SignUpCard /> : <LoginCard />}
    </div>
  );
}
