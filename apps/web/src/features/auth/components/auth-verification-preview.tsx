"use client";

import { Button } from "@/shared/components/ui/button";

import { useAuthDialog } from "../hooks/use-auth-dialog";

export function AuthVerificationPreview() {
  const { openAuth } = useAuthDialog();

  return (
    <div className="flex flex-wrap gap-3">
      <Button onClick={() => openAuth({ mode: "verify-email" })}>Open verification modal</Button>
      <Button
        variant="outline"
        onClick={() => openAuth({ mode: "verify-email", email: "hello@example.com" })}
      >
        Open with resend option
      </Button>
    </div>
  );
}
