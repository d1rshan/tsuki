"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { signUp } from "@tsuki/auth/client";

import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

import { signUpSchema, type SignUpValues } from "../schemas";
import { AuthFormCard } from "./auth-form-card";

const FORM_ID = "signup-form";

export function SignUpCard() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { email: "", name: "", password: "", username: "" },
  });

  async function submit(values: SignUpValues) {
    try {
      const { error } = await signUp.email({
        ...values,
        callbackURL: window.location.origin,
      });

      if (error) {
        toast.error(error.message || "Failed to create account");
        return;
      }

      const destination = new URL("/verify-email", window.location.origin);
      destination.searchParams.set("email", values.email);
      window.location.assign(destination);
    } catch {
      toast.error("Unable to reach the server. Try again.");
    }
  }

  return (
    <AuthFormCard
      title="Create an account"
      description="Start tracking anime and manga on Tsuki."
      alternateHref="/login"
      alternateLabel="Sign in"
      formId={FORM_ID}
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit(submit)}
      submitLabel="Create account"
    >
      <FieldGroup>
        <Field data-invalid={Boolean(errors.name)}>
          <FieldLabel htmlFor="signup-name">Name</FieldLabel>
          <Input
            id="signup-name"
            autoComplete="name"
            {...register("name")}
            aria-invalid={Boolean(errors.name)}
            disabled={isSubmitting}
          />
          <FieldError errors={errors.name ? [errors.name] : []} />
        </Field>
        <Field data-invalid={Boolean(errors.username)}>
          <FieldLabel htmlFor="signup-username">Username</FieldLabel>
          <Input
            id="signup-username"
            autoComplete="username"
            {...register("username")}
            aria-invalid={Boolean(errors.username)}
            disabled={isSubmitting}
          />
          <FieldError errors={errors.username ? [errors.username] : []} />
        </Field>
        <Field data-invalid={Boolean(errors.email)}>
          <FieldLabel htmlFor="signup-email">Email</FieldLabel>
          <Input
            id="signup-email"
            type="email"
            autoComplete="email"
            {...register("email")}
            aria-invalid={Boolean(errors.email)}
            disabled={isSubmitting}
          />
          <FieldError errors={errors.email ? [errors.email] : []} />
        </Field>
        <Field data-invalid={Boolean(errors.password)}>
          <FieldLabel htmlFor="signup-password">Password</FieldLabel>
          <Input
            id="signup-password"
            type="password"
            autoComplete="new-password"
            {...register("password")}
            aria-invalid={Boolean(errors.password)}
            disabled={isSubmitting}
          />
          <FieldError errors={errors.password ? [errors.password] : []} />
        </Field>
      </FieldGroup>
    </AuthFormCard>
  );
}
