"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";

import { signOut } from "@tsuki/auth/client";

import { Button } from "@/components/ui/button";

export function NavigationAuth({ isAuthenticated }: { isAuthenticated: boolean }) {
  const [isSigningOut, setIsSigningOut] = useState(false);

  if (!isAuthenticated) {
    return (
      <Button variant="ghost" size="sm" render={<Link href="/login" />} nativeButton={false}>
        Login
      </Button>
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
    <Button type="button" variant="ghost" size="sm" disabled={isSigningOut} onClick={handleSignOut}>
      {isSigningOut ? "Signing out..." : "Sign out"}
    </Button>
  );
}
