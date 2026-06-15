"use client";

import { useSession } from "@/lib/auth-client";
import { WaveLoader } from "@/components/wave-loader";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isPending } = useSession();

  if (isPending) {
    return <WaveLoader />;
  }

  return <>{children}</>;
}
