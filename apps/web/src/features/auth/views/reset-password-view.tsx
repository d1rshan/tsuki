"use client";

import { revalidateLogic, useForm } from "@tanstack/react-form";
import { CircleCheck, KeyRound } from "lucide-react";

import { authClient } from "@tsuki/auth/client";

import { Button } from "@/shared/components/ui/button";

import { TextField } from "@/shared/components/text-field";

import { AuthForm } from "../components/auth-form";
import { AuthStatus } from "../components/auth-status";
import { useAuthDialog } from "../hooks/use-auth-dialog";
import { resetPasswordSchema } from "../schemas";
import { runAuthRequest } from "../run-auth-request";

export function ResetPasswordView({ token }: { token?: string }) {
  return <ResetPasswordCard token={token} />;
}

function ResetPasswordCard({ token }: { token?: string }) {
  const { openAuth } = useAuthDialog();
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
      <AuthStatus
        icon={KeyRound}
        title="Reset link unavailable"
        description={["This reset link is invalid or has expired."]}
        actions={
          <Button className="w-full" onClick={() => openAuth({ mode: "forgot-password" })}>
            Request a new link
          </Button>
        }
      />
    );

  return (
    <form.Subscribe selector={(state) => state.isSubmitSuccessful}>
      {(isComplete) =>
        isComplete ? (
          <AuthStatus
            icon={CircleCheck}
            title="Password updated"
            description={[
              "Your password has been reset and your sessions were signed out.",
              "You can now sign in with your new password.",
            ]}
            actions={
              <Button className="w-full" onClick={() => openAuth()}>
                Sign in
              </Button>
            }
          />
        ) : (
          <AuthForm
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
              hideLabel
              placeholder="New password"
              type="password"
              autoComplete="new-password"
            />
            <TextField
              form={form}
              name="confirmPassword"
              label="Confirm new password"
              hideLabel
              placeholder="Confirm new password"
              type="password"
              autoComplete="new-password"
            />
          </AuthForm>
        )
      }
    </form.Subscribe>
  );
}
