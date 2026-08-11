"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { CircleCheck, KeyRound } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
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
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

import { resetPasswordSchema, type ResetPasswordValues } from "../schemas";
import { AuthFormCard } from "./auth-form-card";

const FORM_ID = "reset-password-form";

export function ResetPasswordCard({ token }: { token?: string }) {
  const [isComplete, setIsComplete] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
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

  if (!token) {
    return (
      <Card className="w-full max-w-sm">
        <CardHeader className="items-center text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <KeyRound className="size-5 text-primary" aria-hidden="true" />
            Reset link unavailable
          </CardTitle>
          <CardDescription>This reset link is invalid or has expired.</CardDescription>
        </CardHeader>
        <CardFooter className="flex-col gap-2">
          <Button
            className="w-full"
            render={<Link href="/forgot-password" replace />}
            nativeButton={false}
          >
            Request a new link
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (isComplete) {
    return (
      <Card className="w-full max-w-sm">
        <CardHeader className="items-center text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <CircleCheck className="size-5 text-primary" aria-hidden="true" />
            Password updated
          </CardTitle>
          <CardDescription>
            Your password has been reset and your sessions were signed out.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center text-sm text-muted-foreground">
          You can now sign in with your new password.
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <Button className="w-full" render={<Link href="/login" replace />} nativeButton={false}>
            Sign in
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <AuthFormCard
      title="Choose a new password"
      description="Use at least 8 characters."
      alternateHref="/login"
      alternateLabel="Sign in"
      formId={FORM_ID}
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit(submit)}
      submitLabel="Reset password"
    >
      <FieldGroup>
        <Field data-invalid={Boolean(errors.password)}>
          <FieldLabel htmlFor="new-password">New password</FieldLabel>
          <Input
            id="new-password"
            type="password"
            autoComplete="new-password"
            {...register("password")}
            aria-invalid={Boolean(errors.password)}
            disabled={isSubmitting}
          />
          <FieldError errors={errors.password ? [errors.password] : []} />
        </Field>
        <Field data-invalid={Boolean(errors.confirmPassword)}>
          <FieldLabel htmlFor="confirm-password">Confirm new password</FieldLabel>
          <Input
            id="confirm-password"
            type="password"
            autoComplete="new-password"
            {...register("confirmPassword")}
            aria-invalid={Boolean(errors.confirmPassword)}
            disabled={isSubmitting}
          />
          <FieldError errors={errors.confirmPassword ? [errors.confirmPassword] : []} />
        </Field>
      </FieldGroup>
    </AuthFormCard>
  );
}
