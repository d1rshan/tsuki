"use client";

import { useSession } from "@/lib/auth-client";
import { Loader } from "@/components/loader";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isPending } = useSession();

  if (isPending) {
    return <Loader variant="overlay" />;
  }

  return <>{children}</>;
}
