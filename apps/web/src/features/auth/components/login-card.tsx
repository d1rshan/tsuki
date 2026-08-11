"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { signIn } from "@tsuki/auth/client";

import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

import { loginSchema, type LoginValues } from "../schemas";
import { AuthFormCard } from "./auth-form-card";

const FORM_ID = "login-form";

export function LoginCard() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { emailOrUsername: "", password: "" },
  });

  async function submit(values: LoginValues) {
    try {
      const credentials = { password: values.password };
      const { error } = values.emailOrUsername.includes("@")
        ? await signIn.email({ ...credentials, email: values.emailOrUsername })
        : await signIn.username({ ...credentials, username: values.emailOrUsername });

      if (error) {
        toast.error(
          error.code === "EMAIL_NOT_VERIFIED"
            ? "Verify your email with the link we sent, then sign in."
            : error.message || "Failed to sign in",
        );
        return;
      }

      window.location.assign("/");
    } catch {
      toast.error("Unable to reach the server. Try again.");
    }
  }

  return (
    <AuthFormCard
      title="Welcome back"
      description="Sign in with your email or username."
      alternateHref="/login?mode=signup"
      alternateLabel="Sign up"
      formId={FORM_ID}
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit(submit)}
      submitLabel="Sign in"
    >
      <FieldGroup>
        <Field data-invalid={Boolean(errors.emailOrUsername)}>
          <FieldLabel htmlFor="login-identifier">Email or username</FieldLabel>
          <Input
            id="login-identifier"
            autoComplete="username"
            {...register("emailOrUsername")}
            aria-invalid={Boolean(errors.emailOrUsername)}
            disabled={isSubmitting}
          />
          <FieldError errors={errors.emailOrUsername ? [errors.emailOrUsername] : []} />
        </Field>
        <Field data-invalid={Boolean(errors.password)}>
          <FieldLabel htmlFor="login-password">Password</FieldLabel>
          <Input
            id="login-password"
            type="password"
            autoComplete="current-password"
            {...register("password")}
            aria-invalid={Boolean(errors.password)}
            disabled={isSubmitting}
          />
          <FieldError errors={errors.password ? [errors.password] : []} />
        </Field>
        <Link
          href="/forgot-password"
          className="text-sm text-primary underline-offset-4 hover:underline"
        >
          Forgot password?
        </Link>
      </FieldGroup>
    </AuthFormCard>
  );
}
