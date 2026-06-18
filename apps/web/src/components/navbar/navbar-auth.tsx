"use client";

import { useSession, signOut } from "@/lib/auth-client";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

export function NavbarAuth() {
  const { data: session } = useSession();
  const router = useRouter();

  if (session) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="font-semibold"
        onClick={async () => {
          await signOut();
          router.push("/");
        }}
      >
        LOGOUT
      </Button>
    );
  }

  return (
    <Link
      href="/login"
      prefetch
      className="inline-flex items-center text-[10px] font-black uppercase tracking-[0.2em] text-white/85 transition hover:text-white"
    >
      Login
    </Link>
  );
}
