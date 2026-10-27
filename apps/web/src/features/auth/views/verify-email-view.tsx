"use client";

import { LoaderCircle, MailCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { authClient } from "@tsuki/auth/client";
import { env } from "@tsuki/env/web";

import { Button } from "@/shared/components/ui/button";

import { AuthStatus } from "../components/auth-status";
import { useAuthDialog } from "../hooks/use-auth-dialog";

export function VerifyEmailView({ email }: { email?: string }) {
  return email ? <VerifyEmailResendCard email={email} /> : <VerifyEmailCard />;
}

function VerifyEmailCard() {
  return (
    <AuthStatus
      icon={MailCheck}
      title="Check your inbox"
      description={[
        "We sent you a verification link.",
        "Open the link to verify your email and enter Tsuki. Check spam if it does not arrive soon.",
      ]}
      actions={<BackToSignInButton />}
    />
  );
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
    <AuthStatus
      icon={MailCheck}
      title="Check your inbox"
      description={[
        `We sent a verification link to ${email}.`,
        "Open the link to verify your email and enter Tsuki. Check spam if it does not arrive soon.",
      ]}
      actions={
        <>
          <BackToSignInButton />
          <Button
            variant="outline"
            className="w-full"
            disabled={isResending}
            onClick={resendVerificationEmail}
          >
            {isResending ? <LoaderCircle className="animate-spin" /> : null}
            Resend verification email
          </Button>
        </>
      }
    />
  );
}

function BackToSignInButton() {
  const { openAuth } = useAuthDialog();
  return (
    <Button variant="link" className="w-full" onClick={() => openAuth()}>
      Back to sign in
    </Button>
  );
}
