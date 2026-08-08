"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { toast } from "sonner";

import { signOut } from "@tsuki/auth/client";

import { Button } from "@/components/ui/button";
import { cn } from "@/shared/lib/utils";

export function NavigationAuth({
  isAuthenticated,
  isMobile = false,
}: {
  isAuthenticated: boolean;
  isMobile?: boolean;
}) {
  const [isSigningOut, setIsSigningOut] = useState(false);
  const pathname = usePathname();

  if (!isAuthenticated) {
    return (
      <Link
        href="/login"
        className={cn(
          isMobile
            ? "flex w-full items-center rounded-lg px-3 py-3 text-xs font-black uppercase tracking-widest transition-all duration-300"
            : "group/link inline-flex items-center py-2 text-xs font-black uppercase tracking-widest transition-all duration-300 hover:text-foreground",
          pathname === "/login" ? "text-foreground" : "text-muted-foreground",
          isMobile &&
            (pathname === "/login"
              ? "bg-foreground/5"
              : "hover:bg-foreground/5 hover:text-foreground"),
        )}
      >
        {isMobile ? (
          "Login"
        ) : (
          <span className="relative">
            Login
            <span
              className={cn(
                "absolute -bottom-1 left-0 h-px bg-foreground transition-all duration-300",
                pathname === "/login" ? "w-full" : "w-0 group-hover/link:w-full",
              )}
            />
          </span>
        )}
      </Link>
    );
  }

  async function handleSignOut() {
    setIsSigningOut(true);
    try {
      const { error } = await signOut();

      if (!error) {
        window.location.assign("/");
        return;
      }

      toast.error(error.message || "Failed to sign out");
    } catch {
      toast.error("Failed to sign out");
    } finally {
      setIsSigningOut(false);
    }
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      disabled={isSigningOut}
      className={cn(
        "text-xs font-black uppercase tracking-widest text-muted-foreground hover:!bg-transparent hover:text-foreground",
        isMobile && "justify-start px-2 py-3",
      )}
      onClick={handleSignOut}
    >
      {isSigningOut ? "LOGGING OUT..." : "LOGOUT"}
    </Button>
  );
}
