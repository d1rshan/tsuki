import { redirect } from "next/navigation";
import { headers } from "next/headers";

import { LoginClient } from "@/components/login/login-client";
import { authClient } from "@/lib/auth-client";

export default async function LoginPage() {
  const { data: session } = await authClient.getSession({
    fetchOptions: {
      headers: await headers(),
    },
  });

  if (session) {
    redirect("/");
  }

  return <LoginClient />;
}
