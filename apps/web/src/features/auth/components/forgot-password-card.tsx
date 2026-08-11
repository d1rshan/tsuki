"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { authClient } from "@tsuki/auth/client";
import { env } from "@tsuki/env/web";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

import { forgotPasswordSchema, type ForgotPasswordValues } from "../schemas";
import { AuthFormCard } from "./auth-form-card";

const FORM_ID = "forgot-password-form";

export function ForgotPasswordCard() {
  const [isSent, setIsSent] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
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

  if (isSent) {
    return (
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Check your inbox</CardTitle>
          <CardDescription>
            If that email belongs to a Tsuki account, we sent a password-reset link.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          The link expires in 30 minutes. Check spam if it does not arrive soon.
        </CardContent>
        <CardFooter>
          <Button className="w-full" variant="link" render={<Link href="/login" replace />}>
            Back to sign in
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <AuthFormCard
      title="Reset your password"
      description="Enter your email and we will send a reset link."
      alternateHref="/login"
      alternateLabel="Sign in"
      formId={FORM_ID}
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit(submit)}
      submitLabel="Send reset link"
    >
      <FieldGroup>
        <Field data-invalid={Boolean(errors.email)}>
          <FieldLabel htmlFor="forgot-password-email">Email</FieldLabel>
          <Input
            id="forgot-password-email"
            type="email"
            autoComplete="email"
            {...register("email")}
            aria-invalid={Boolean(errors.email)}
            disabled={isSubmitting}
          />
          <FieldError errors={errors.email ? [errors.email] : []} />
        </Field>
      </FieldGroup>
    </AuthFormCard>
  );
}
