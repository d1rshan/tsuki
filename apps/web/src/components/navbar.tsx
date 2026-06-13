"use client";

import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "./ui/button";
import { useSession, signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

// TODO: make navbar server component - to check the auth state at server side
export function Navbar() {
  const { data: session } = useSession();
  const router = useRouter();

  return (
    <nav className="fixed top-4 left-1/2 z-50 h-12 w-full max-w-5xl -translate-x-1/2 flex items-center justify-between rounded-xl border border-border bg-background/50 px-5 backdrop-blur-md">
      <Link href="/" className="text-md font-bold tracking-tight">
        ANILOG
      </Link>
      <div className="flex items-center gap-1">
        {!session ? (
          <Button variant="ghost" size="sm" className="font-semibold">
            <Link href="/login">LOGIN</Link>
          </Button>
        ) : (
          <Button variant="ghost" size="sm" className="font-semibold" onClick={async () => {
            await signOut();
            router.push("/login");
          }}>
            LOGOUT
          </Button>
        )}
        <ThemeToggle />
      </div>
    </nav>
  );
}
