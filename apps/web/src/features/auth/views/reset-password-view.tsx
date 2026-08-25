"use client";

import Link from "next/link";
import { revalidateLogic, useForm } from "@tanstack/react-form";
import { CircleCheck, KeyRound } from "lucide-react";

import { authClient } from "@tsuki/auth/client";

import { Button } from "@/shared/components/ui/button";

import { AuthFormCard } from "../components/auth-form-card";
import { AuthStatusCard } from "../components/auth-status-card";
import { TextField } from "@/shared/components/text-field";
import { resetPasswordSchema } from "../schemas";
import { runAuthRequest } from "../run-auth-request";

export function ResetPasswordView({ token }: { token?: string }) {
  return <ResetPasswordCard token={token} />;
}

function ResetPasswordCard({ token }: { token?: string }) {
  const form = useForm({
    defaultValues: { password: "", confirmPassword: "" },
    validationLogic: revalidateLogic(),
    validators: { onDynamic: resetPasswordSchema },
    onSubmit: async ({ value }) => {
      if (!token) return;
      await runAuthRequest(
        authClient.resetPassword({ newPassword: value.password, token }),
        "Unable to reset your password.",
      );
    },
  });

  if (!token)
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

  return (
    <form.Subscribe selector={(state) => state.isSubmitSuccessful}>
      {(isComplete) =>
        isComplete ? (
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
        ) : (
          <AuthFormCard
            form={form}
            title="Choose a new password"
            description="Use at least 8 characters."
            action="sign-in"
            submitLabel="Reset password"
          >
            <TextField
              form={form}
              name="password"
              label="New password"
              type="password"
              autoComplete="new-password"
            />
            <TextField
              form={form}
              name="confirmPassword"
              label="Confirm new password"
              type="password"
              autoComplete="new-password"
            />
          </AuthFormCard>
        )
      }
    </form.Subscribe>
  );
}
