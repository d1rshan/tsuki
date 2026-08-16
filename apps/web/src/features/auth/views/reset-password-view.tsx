"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { CircleCheck, KeyRound } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { authClient } from "@tsuki/auth/client";

import { Button } from "@/shared/components/ui/button";

import { resetPasswordSchema, type ResetPasswordValues } from "../schemas";
import { AuthField } from "../components/auth-field";
import { AuthFormCard } from "../components/auth-form-card";
import { AuthStatusCard } from "../components/auth-status-card";

export function ResetPasswordView({ token }: { token?: string }) {
  return <ResetPasswordCard token={token} />;
}

function ResetPasswordCard({ token }: { token?: string }) {
  const [isComplete, setIsComplete] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
  });

  async function submit({ password }: ResetPasswordValues) {
    if (!token) return;

    try {
      const { error: resetError } = await authClient.resetPassword({
        newPassword: password,
        token,
      });

      if (resetError) {
        toast.error(resetError.message || "Unable to reset your password.");
        return;
      }

      setIsComplete(true);
    } catch {
      toast.error("Unable to reach the server. Try again.");
    }
  }

  if (!token) return <ResetLinkUnavailableCard />;

  if (isComplete) return <PasswordUpdatedCard />;

  return (
    <AuthFormCard
      title="Choose a new password"
      description="Use at least 8 characters."
      action="sign-in"
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit(submit)}
      submitLabel="Reset password"
    >
      <AuthField
        label="New password"
        type="password"
        autoComplete="new-password"
        registration={register("password")}
        error={errors.password}
      />
      <AuthField
        label="Confirm new password"
        type="password"
        autoComplete="new-password"
        registration={register("confirmPassword")}
        error={errors.confirmPassword}
      />
    </AuthFormCard>
  );
}

function ResetLinkUnavailableCard() {
  return (
    <AuthStatusCard
      icon={KeyRound}
      title="Reset link unavailable"
      description={["This reset link is invalid or has expired."]}
      actions={
        <Button render={<Link href="/forgot-password" replace />} nativeButton={false}>
          Request a new link
        </Button>
      }
    />
  );
}

function PasswordUpdatedCard() {
  return (
    <AuthStatusCard
      icon={CircleCheck}
      title="Password updated"
      description={[
        "Your password has been reset and your sessions were signed out.",
        "You can now sign in with your new password.",
      ]}
      actions={
        <Button render={<Link href="/login" replace />} nativeButton={false}>
          Sign in
        </Button>
      }
    />
  );
}
