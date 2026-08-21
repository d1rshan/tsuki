"use client";

import Link from "next/link";
import { revalidateLogic, useForm } from "@tanstack/react-form";
import { MailCheck } from "lucide-react";
import { toast } from "sonner";

import { authClient } from "@tsuki/auth/client";
import { env } from "@tsuki/env/web";

import { Button } from "@/shared/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";

import { AuthFormCard } from "../components/auth-form-card";
import { AuthStatusCard } from "../components/auth-status-card";
import { forgotPasswordSchema } from "../schemas";

export function ForgotPasswordView() {
  return <ForgotPasswordCard />;
}

function ForgotPasswordCard() {
  const form = useForm({
    defaultValues: { email: "" },
    validationLogic: revalidateLogic(),
    validators: { onDynamic: forgotPasswordSchema },
    onSubmit: async ({ value }) => {
      const { error } = await authClient
        .requestPasswordReset({
          email: value.email,
          redirectTo: `${env.NEXT_PUBLIC_APP_URL}/reset-password`,
        })
        .catch(() => {
          toast.error("Unable to reach the server. Try again.");
          throw new Error("Unable to reach the server");
        });

      if (error) {
        const message = error.message || "Unable to send the reset email.";
        toast.error(message);
        throw new Error(message);
      }
    },
  });

  return (
    <form.Subscribe selector={(state) => state.isSubmitSuccessful}>
      {(isSent) =>
        isSent ? (
          <ForgotPasswordSentCard />
        ) : (
          <form.Subscribe selector={(state) => state.isSubmitting}>
            {(isSubmitting) => (
              <AuthFormCard
                title="Reset your password"
                description="Enter your email and we will send a reset link."
                action="sign-in"
                isSubmitting={isSubmitting}
                onSubmit={(event) => {
                  event.preventDefault();
                  void form.handleSubmit().catch(() => undefined);
                }}
                submitLabel="Send reset link"
              >
                <form.Field name="email">
                  {(field) => {
                    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                        <Input
                          id={field.name}
                          name={field.name}
                          type="email"
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(event) => field.handleChange(event.target.value)}
                          autoComplete="email"
                          aria-invalid={isInvalid}
                        />
                        {isInvalid && <FieldError errors={field.state.meta.errors} />}
                      </Field>
                    );
                  }}
                </form.Field>
              </AuthFormCard>
            )}
          </form.Subscribe>
        )
      }
    </form.Subscribe>
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
