"use client";

import Link from "next/link";
import { useForm } from "@tanstack/react-form";
import { CircleCheck, KeyRound } from "lucide-react";
import { toast } from "sonner";

import { authClient } from "@tsuki/auth/client";

import { Button } from "@/shared/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";

import { AuthFormCard } from "../components/auth-form-card";
import { AuthStatusCard } from "../components/auth-status-card";
import { resetPasswordSchema } from "../schemas";

export function ResetPasswordView({ token }: { token?: string }) {
  return <ResetPasswordCard token={token} />;
}

function ResetPasswordCard({ token }: { token?: string }) {
  const form = useForm({
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
    validators: { onSubmit: resetPasswordSchema },
    onSubmit: async ({ value }) => {
      if (!token) return;

      const { error } = await authClient
        .resetPassword({ newPassword: value.password, token })
        .catch(() => {
          toast.error("Unable to reach the server. Try again.");
          throw new Error("Unable to reach the server");
        });

      if (error) {
        const message = error.message || "Unable to reset your password.";
        toast.error(message);
        throw new Error(message);
      }
    },
  });

  if (!token) return <ResetLinkUnavailableCard />;

  return (
    <form.Subscribe selector={(state) => state.isSubmitSuccessful}>
      {(isComplete) =>
        isComplete ? (
          <PasswordUpdatedCard />
        ) : (
          <form.Subscribe selector={(state) => state.isSubmitting}>
            {(isSubmitting) => (
              <AuthFormCard
                title="Choose a new password"
                description="Use at least 8 characters."
                action="sign-in"
                isSubmitting={isSubmitting}
                onSubmit={(event) => {
                  event.preventDefault();
                  void form.handleSubmit().catch(() => undefined);
                }}
                submitLabel="Reset password"
              >
                <form.Field name="password">
                  {(field) => {
                    const isInvalid = !field.state.meta.isValid;

                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>New password</FieldLabel>
                        <Input
                          id={field.name}
                          name={field.name}
                          type="password"
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(event) => field.handleChange(event.target.value)}
                          autoComplete="new-password"
                          aria-invalid={isInvalid}
                        />
                        {isInvalid && <FieldError errors={field.state.meta.errors} />}
                      </Field>
                    );
                  }}
                </form.Field>
                <form.Field name="confirmPassword">
                  {(field) => {
                    const isInvalid = !field.state.meta.isValid;

                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>Confirm new password</FieldLabel>
                        <Input
                          id={field.name}
                          name={field.name}
                          type="password"
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(event) => field.handleChange(event.target.value)}
                          autoComplete="new-password"
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
