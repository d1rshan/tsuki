"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { revalidateLogic, useForm } from "@tanstack/react-form";

import { signIn, signUp } from "@tsuki/auth/client";

import { AuthFormCard } from "../components/auth-form-card";
import { TextField } from "@/shared/components/text-field";
import { loginSchema, signUpSchema } from "../schemas";
import { runAuthRequest } from "../run-auth-request";

export function LoginView({ mode }: { mode?: string }) {
  return mode === "signup" ? <SignupCard /> : <LoginCard />;
}

function LoginCard() {
  const router = useRouter();
  const form = useForm({
    defaultValues: { emailOrUsername: "", password: "" },
    validationLogic: revalidateLogic(),
    validators: { onDynamic: loginSchema },
    onSubmit: async ({ value }) => {
      const values = loginSchema.parse(value);
      const credentials = { password: values.password };
      const request = values.emailOrUsername.includes("@")
        ? signIn.email({ ...credentials, email: values.emailOrUsername })
        : signIn.username({ ...credentials, username: values.emailOrUsername });

      await runAuthRequest(request, "Failed to sign in");

      router.push("/");
      router.refresh();
    },
  });

  return (
    <AuthFormCard
      form={form}
      title="Welcome back"
      description="Sign in with your email or username."
      action="sign-up"
      submitLabel="Sign in"
    >
      <TextField
        form={form}
        name="emailOrUsername"
        label="Email or username"
        autoComplete="username"
      />
      <TextField
        form={form}
        name="password"
        label="Password"
        type="password"
        autoComplete="current-password"
      />
      <Link
        href="/forgot-password"
        className="text-sm text-primary underline-offset-4 hover:underline"
      >
        Forgot password?
      </Link>
    </AuthFormCard>
  );
}

function SignupCard() {
  const form = useForm({
    defaultValues: { name: "", username: "", email: "", password: "" },
    validationLogic: revalidateLogic(),
    validators: { onDynamic: signUpSchema },
    onSubmit: async ({ value }) => {
      const values = signUpSchema.parse(value);
      await runAuthRequest(
        signUp.email({ ...values, callbackURL: window.location.origin }),
        "Failed to create account",
      );

      const destination = new URL("/verify-email", window.location.origin);
      destination.searchParams.set("email", values.email);
      window.location.assign(destination);
    },
  });

  return (
    <AuthFormCard
      form={form}
      title="Create an account"
      description="Start tracking anime and manga on Tsuki."
      action="sign-in"
      submitLabel="Create account"
    >
      <TextField form={form} name="name" label="Name" autoComplete="name" />
      <TextField form={form} name="username" label="Username" autoComplete="username" />
      <TextField form={form} name="email" label="Email" type="email" autoComplete="email" />
      <TextField
        form={form}
        name="password"
        label="Password"
        type="password"
        autoComplete="new-password"
      />
    </AuthFormCard>
  );
}
