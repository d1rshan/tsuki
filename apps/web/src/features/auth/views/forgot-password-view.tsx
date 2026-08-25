"use client";

import Link from "next/link";
import { revalidateLogic, useForm } from "@tanstack/react-form";
import { MailCheck } from "lucide-react";

import { authClient } from "@tsuki/auth/client";
import { env } from "@tsuki/env/web";

import { Button } from "@/shared/components/ui/button";

import { AuthFormCard } from "../components/auth-form-card";
import { AuthStatusCard } from "../components/auth-status-card";
import { TextField } from "@/shared/components/text-field";
import { forgotPasswordSchema } from "../schemas";
import { runAuthRequest } from "../run-auth-request";

export function ForgotPasswordView() {
  return <ForgotPasswordCard />;
}

function ForgotPasswordCard() {
  const form = useForm({
    defaultValues: { email: "" },
    validationLogic: revalidateLogic(),
    validators: { onDynamic: forgotPasswordSchema },
    onSubmit: async ({ value }) =>
      runAuthRequest(
        authClient.requestPasswordReset({
          email: value.email,
          redirectTo: `${env.NEXT_PUBLIC_APP_URL}/reset-password`,
        }),
        "Unable to send the reset email.",
      ),
  });

  return (
    <form.Subscribe selector={(state) => state.isSubmitSuccessful}>
      {(isSent) =>
        isSent ? (
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
        ) : (
          <AuthFormCard
            form={form}
            title="Reset your password"
            description="Enter your email and we will send a reset link."
            action="sign-in"
            submitLabel="Send reset link"
          >
            <TextField form={form} name="email" label="Email" type="email" autoComplete="email" />
          </AuthFormCard>
        )
      }
    </form.Subscribe>
  );
}
