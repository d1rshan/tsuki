import { redirect } from "next/navigation";

import { LoginClient } from "@/components/login/login-client";
import { auth } from "@/lib/auth";

export default async function LoginPage() {
  const { user } = await auth();

  if (user) {
    redirect("/");
  }

  return <LoginClient />;
}
