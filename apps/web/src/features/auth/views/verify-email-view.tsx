"use client";

import { LoaderCircle, MailCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { authClient } from "@tsuki/auth/client";
import { env } from "@tsuki/env/web";

import { Button } from "@/shared/components/ui/button";
import { DialogDescription, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";

export function VerifyEmailView({ email }: { email?: string }) {
  return email ? <VerifyEmailResendCard email={email} /> : <VerifyEmailCard />;
}

function VerifyEmailCard() {
  return <VerificationHeader />;
}

function VerifyEmailResendCard({ email }: { email: string }) {
  const [isResending, setIsResending] = useState(false);

  async function resendVerificationEmail() {
    setIsResending(true);

    try {
      const { error } = await authClient.sendVerificationEmail({
        email,
        callbackURL: env.NEXT_PUBLIC_APP_URL,
      });

      if (error) {
        toast.error(error.message || "Unable to resend the verification email.");
        return;
      }

      toast.success("Verification email sent.");
    } catch {
      toast.error("Unable to reach the server. Try again.");
    } finally {
      setIsResending(false);
    }
  }

  return (
    <>
      <VerificationHeader email={email} />
      <div className="flex justify-end">
        <Button variant="secondary" disabled={isResending} onClick={resendVerificationEmail}>
          {isResending ? <LoaderCircle data-icon="inline-start" className="animate-spin" /> : null}
          Resend email
        </Button>
      </div>
    </>
  );
}

function VerificationHeader({ email }: { email?: string }) {
  return (
    <DialogHeader>
      <div className="flex items-center gap-2">
        <MailCheck className="size-5" aria-hidden="true" />
        <DialogTitle className="text-lg font-medium md:text-base">Check your inbox</DialogTitle>
      </div>
      <DialogDescription className="break-words">
        <span className="mb-1 block">Hey, welcome to Tsuki!</span>
        <span className="block">
          {email ? `We sent a link to ${email}.` : "Check your email for a verification link."} Just
          verify your email and you’re all set. Promise!
        </span>
      </DialogDescription>
    </DialogHeader>
  );
}
