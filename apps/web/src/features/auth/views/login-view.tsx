"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { signIn, signUp } from "@tsuki/auth/client";

import { loginSchema, signUpSchema, type LoginValues, type SignUpValues } from "../schemas";
import { AuthField } from "../components/auth-field";
import { AuthFormCard } from "../components/auth-form-card";

export function LoginView({ mode }: { mode?: string }) {
  return mode === "signup" ? <SignupCard /> : <LoginCard />;
}

function LoginCard() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
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

      router.push("/");
    } catch {
      toast.error("Unable to reach the server. Try again.");
    }
  }

  return (
    <AuthFormCard
      title="Welcome back"
      description="Sign in with your email or username."
      action="sign-up"
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit(submit)}
      submitLabel="Sign in"
    >
      <AuthField
        label="Email or username"
        autoComplete="username"
        registration={register("emailOrUsername")}
        error={errors.emailOrUsername}
      />
      <AuthField
        label="Password"
        type="password"
        autoComplete="current-password"
        registration={register("password")}
        error={errors.password}
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
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
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
      action="sign-in"
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit(submit)}
      submitLabel="Create account"
    >
      <AuthField
        label="Name"
        autoComplete="name"
        registration={register("name")}
        error={errors.name}
      />
      <AuthField
        label="Username"
        autoComplete="username"
        registration={register("username")}
        error={errors.username}
      />
      <AuthField
        label="Email"
        type="email"
        autoComplete="email"
        registration={register("email")}
        error={errors.email}
      />
      <AuthField
        label="Password"
        type="password"
        autoComplete="new-password"
        registration={register("password")}
        error={errors.password}
      />
    </AuthFormCard>
  );
}
