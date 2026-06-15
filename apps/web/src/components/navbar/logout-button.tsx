"use client";

import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth-client";

export function LogoutButton() {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="font-semibold"
      onClick={async () => {
        await signOut();
      }}
    >
      LOGOUT
    </Button>
  );
}
