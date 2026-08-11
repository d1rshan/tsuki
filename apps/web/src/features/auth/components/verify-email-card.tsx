"use client";

import Link from "next/link";
import { LoaderCircle, MailCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { authClient } from "@tsuki/auth/client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function VerifyEmailCard({ email }: { email?: string }) {
  const [isResending, setIsResending] = useState(false);

  async function resendVerificationEmail() {
    if (!email) return;

    setIsResending(true);

    try {
      const { error } = await authClient.sendVerificationEmail({
        email,
        callbackURL: window.location.origin,
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
    <Card className="w-full max-w-sm">
      <CardHeader className="items-center text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <MailCheck className="size-5 text-primary" aria-hidden="true" />
          Check your inbox
        </CardTitle>
        <CardDescription>
          {email ? (
            <>
              We sent a verification link to{" "}
              <span className="font-medium text-foreground">{email}</span>.
            </>
          ) : (
            "We sent you a verification link."
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center text-sm text-muted-foreground">
        Open the link to verify your email and enter Tsuki. Check spam if it does not arrive soon.
      </CardContent>
      <CardFooter className="flex-col gap-2">
        {email && (
          <Button
            className="w-full"
            variant="outline"
            disabled={isResending}
            onClick={resendVerificationEmail}
          >
            {isResending ? <LoaderCircle className="animate-spin" /> : null}
            Resend verification email
          </Button>
        )}
        <Button className="w-full" variant="link" render={<Link href="/login" replace />}>
          Back to sign in
        </Button>
      </CardFooter>
    </Card>
  );
}
