import Link from "next/link";
import { headers } from "next/headers";
import { Suspense } from "react";

import { authClient } from "@/lib/auth-client";
import { ThemeToggle } from "../theme-toggle";
import { Button } from "../ui/button";
import { LogoutButton } from "./logout-button";
import { Loader2 } from "lucide-react";

export function Navbar() {
  return (
    <nav className="fixed top-4 left-1/2 z-50 h-12 w-full max-w-5xl -translate-x-1/2 flex items-center justify-between rounded-xl border border-border bg-background/50 px-5 backdrop-blur-md">
      <Link href="/" className="text-md font-bold tracking-tight">
        TSUKI
      </Link>
      <div className="flex items-center gap-1">
        <Suspense fallback={<Loader2 className="animate-spin" />}>
          <AuthStuff />
        </Suspense>
        <ThemeToggle />
      </div>
    </nav>
  );
}

async function AuthStuff() {
  const { data: session } = await authClient.getSession({
    fetchOptions: {
      headers: await headers(),
    },
  });

  return (
    <>
      {!session ? (
        <Button variant="ghost" size="sm" className="font-semibold">
          <Link href="/login">LOGIN</Link>
        </Button>
      ) : (
        <LogoutButton />
      )}
    </>
  );
}
