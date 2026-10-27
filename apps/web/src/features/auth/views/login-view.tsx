"use client";

import { useRouter } from "next/navigation";
import { revalidateLogic, useForm } from "@tanstack/react-form";

import { signIn, signUp } from "@tsuki/auth/client";

import { TextField } from "@/shared/components/text-field";
import { Button } from "@/shared/components/ui/button";
import { DialogDescription, DialogTitle } from "@/shared/components/ui/dialog";

import { AuthForm } from "../components/auth-form";
import { useAuthDialog } from "../hooks/use-auth-dialog";
import { loginSchema, signUpSchema } from "../schemas";
import { runAuthRequest } from "../run-auth-request";

export function LoginView({ mode }: { mode: "sign-in" | "sign-up" }) {
  return (
    <>
      <DialogTitle className="sr-only">{mode === "sign-in" ? "Log in" : "Sign up"}</DialogTitle>
      <DialogDescription className="sr-only">Sign in or create an account.</DialogDescription>
      {mode === "sign-in" ? <LoginCard /> : <SignupCard />}
    </>
  );
}

function LoginCard() {
  const router = useRouter();
  const { openAuth, closeAuth } = useAuthDialog();
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

      closeAuth();
      router.refresh();
    },
  });

  return (
    <AuthForm
      form={form}
      title="Welcome back"
      description="Sign in to your Tsuki account."
      showHeader={false}
      action="sign-up"
      compactSubmit
      submitLabel="Log in"
    >
      <TextField
        form={form}
        name="emailOrUsername"
        label="Email or username"
        hideLabel
        placeholder="Email or username"
        autoComplete="username"
      />
      <div className="relative">
        <TextField
          form={form}
          name="password"
          label="Password"
          hideLabel
          placeholder="Password"
          type="password"
          autoComplete="current-password"
          className="pr-20"
        />
        <Button
          type="button"
          variant="link"
          aria-label="Forgot password?"
          className="absolute top-0 right-1 h-10.5"
          onClick={() => openAuth({ mode: "forgot-password" })}
        >
          Forgot?
        </Button>
      </div>
    </AuthForm>
  );
}

function SignupCard() {
  const { openAuth } = useAuthDialog();
  const form = useForm({
    defaultValues: { username: "", email: "", password: "" },
    validationLogic: revalidateLogic(),
    validators: { onDynamic: signUpSchema },
    onSubmit: async ({ value }) => {
      const values = signUpSchema.parse(value);
      await runAuthRequest(
        signUp.email({ ...values, name: values.username, callbackURL: window.location.origin }),
        "Failed to create account",
      );

      openAuth({ mode: "verify-email", email: values.email });
    },
  });

  return (
    <AuthForm
      form={form}
      title="Create an account"
      description="Start tracking anime and manga with Tsuki."
      showHeader={false}
      action="sign-in"
      compactSubmit
      submitLabel="Sign up"
    >
      <TextField
        form={form}
        name="username"
        label="Username"
        hideLabel
        placeholder="Username"
        autoComplete="username"
      />
      <TextField
        form={form}
        name="email"
        label="Email"
        hideLabel
        placeholder="Email"
        type="email"
        autoComplete="email"
      />
      <TextField
        form={form}
        name="password"
        label="Password"
        hideLabel
        placeholder="Password"
        type="password"
        autoComplete="new-password"
      />
    </AuthForm>
  );
}
