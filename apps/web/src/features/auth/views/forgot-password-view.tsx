"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { MailCheck } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { authClient } from "@tsuki/auth/client";
import { env } from "@tsuki/env/web";

import { Button } from "@/shared/components/ui/button";

import { forgotPasswordSchema, type ForgotPasswordValues } from "../schemas";
import { AuthField } from "../components/auth-field";
import { AuthFormCard } from "../components/auth-form-card";
import { AuthStatusCard } from "../components/auth-status-card";

export function ForgotPasswordView() {
  return <ForgotPasswordCard />;
}

function ForgotPasswordCard() {
  const [isSent, setIsSent] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  async function submit({ email }: ForgotPasswordValues) {
    try {
      const { error } = await authClient.requestPasswordReset({
        email,
        redirectTo: `${env.NEXT_PUBLIC_APP_URL}/reset-password`,
      });

      if (error) {
        toast.error(error.message || "Unable to send the reset email.");
        return;
      }

      setIsSent(true);
    } catch {
      toast.error("Unable to reach the server. Try again.");
    }
  }

  if (isSent) return <ForgotPasswordSentCard />;

  return (
    <AuthFormCard
      title="Reset your password"
      description="Enter your email and we will send a reset link."
      action="sign-in"
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit(submit)}
      submitLabel="Send reset link"
    >
      <AuthField
        label="Email"
        type="email"
        autoComplete="email"
        registration={register("email")}
        error={errors.email}
      />
    </AuthFormCard>
  );
}

function ForgotPasswordSentCard() {
  return (
    <AuthStatusCard
      icon={MailCheck}
      title="Check your inbox"
      description={[
        "If that email belongs to a Tsuki account, we sent a password-reset link.",
        "The link expires in 30 minutes. Check spam if it does not arrive soon.",
      ]}
      actions={
        <Button variant="link" render={<Link href="/login" replace />} nativeButton={false}>
          Back to sign in
        </Button>
      }
    />
  );
}
