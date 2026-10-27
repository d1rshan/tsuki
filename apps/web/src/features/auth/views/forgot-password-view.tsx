"use client";

import { revalidateLogic, useForm } from "@tanstack/react-form";
import { ArrowLeft, Check, LoaderCircle, MailCheck } from "lucide-react";

import { authClient } from "@tsuki/auth/client";
import { env } from "@tsuki/env/web";

import { Button } from "@/shared/components/ui/button";
import { DialogDescription, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { FieldSet } from "@/shared/components/ui/field";

import { TextField } from "@/shared/components/text-field";

import { AuthStatus } from "../components/auth-status";
import { useAuthDialog } from "../hooks/use-auth-dialog";
import { forgotPasswordSchema } from "../schemas";
import { runAuthRequest } from "../run-auth-request";

export function ForgotPasswordView() {
  return <ForgotPasswordCard />;
}

function ForgotPasswordCard() {
  const { openAuth } = useAuthDialog();
  const form = useForm({
    defaultValues: { email: "" },
    validationLogic: revalidateLogic(),
    validators: { onDynamic: forgotPasswordSchema },
    onSubmit: async ({ value }) =>
      runAuthRequest(
        authClient.requestPasswordReset({
          email: value.email,
          redirectTo: `${env.NEXT_PUBLIC_APP_URL}/?auth=reset-password`,
        }),
        "Unable to send the reset email.",
      ),
  });

  return (
    <form.Subscribe selector={(state) => state.isSubmitSuccessful}>
      {(isSent) =>
        isSent ? (
          <AuthStatus
            icon={MailCheck}
            title="Check your inbox"
            description={[
              "If that email belongs to a Tsuki account, we sent a password-reset link.",
              "The link expires in 30 minutes. Check spam if it does not arrive soon.",
            ]}
            actions={
              <Button variant="link" className="w-full" onClick={() => openAuth()}>
                Back to sign in
              </Button>
            }
          />
        ) : (
          <form
            className="grid gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              void form.handleSubmit().catch(() => undefined);
            }}
          >
            <DialogHeader>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Back to sign in"
                  onClick={() => openAuth()}
                >
                  <ArrowLeft aria-hidden="true" />
                </Button>
                <DialogTitle className="text-lg font-medium md:text-base">
                  Reset your password
                </DialogTitle>
              </div>
              <DialogDescription className="sr-only">Request a password reset.</DialogDescription>
            </DialogHeader>
            <form.Subscribe selector={(state) => state.isSubmitting}>
              {(isSubmitting) => (
                <FieldSet disabled={isSubmitting}>
                  <div className="flex items-start gap-2">
                    <div className="min-w-0 flex-1">
                      <TextField
                        form={form}
                        name="email"
                        label="Email"
                        hideLabel
                        placeholder="Email"
                        type="email"
                        autoComplete="email"
                      />
                    </div>
                    <Button
                      type="submit"
                      variant="secondary"
                      size="icon"
                      className="size-10.5 rounded-full"
                      aria-label="Send reset link"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? <LoaderCircle className="animate-spin" /> : <Check />}
                    </Button>
                  </div>
                </FieldSet>
              )}
            </form.Subscribe>
          </form>
        )
      }
    </form.Subscribe>
  );
}
