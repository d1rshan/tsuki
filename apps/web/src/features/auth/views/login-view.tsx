"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";

import { signIn, signUp } from "@tsuki/auth/client";

import { Field, FieldError, FieldLabel } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";

import { AuthFormCard } from "../components/auth-form-card";
import { loginSchema, signUpSchema } from "../schemas";

export function LoginView({ mode }: { mode?: string }) {
  return mode === "signup" ? <SignupCard /> : <LoginCard />;
}

function LoginCard() {
  const router = useRouter();
  const form = useForm({
    defaultValues: {
      emailOrUsername: "",
      password: "",
    },
    validators: { onSubmit: loginSchema },
    onSubmit: async ({ value }) => {
      const values = loginSchema.parse(value);
      const credentials = { password: values.password };
      const request = values.emailOrUsername.includes("@")
        ? signIn.email({ ...credentials, email: values.emailOrUsername })
        : signIn.username({ ...credentials, username: values.emailOrUsername });
      const { error } = await request.catch(() => {
        toast.error("Unable to reach the server. Try again.");
        throw new Error("Unable to reach the server");
      });

      if (error) {
        const message =
          error.code === "EMAIL_NOT_VERIFIED"
            ? "Verify your email with the link we sent, then sign in."
            : error.message || "Failed to sign in";
        toast.error(message);
        throw new Error(message);
      }

      router.push("/");
    },
  });

  return (
    <form.Subscribe selector={(state) => state.isSubmitting}>
      {(isSubmitting) => (
        <AuthFormCard
          title="Welcome back"
          description="Sign in with your email or username."
          action="sign-up"
          isSubmitting={isSubmitting}
          onSubmit={(event) => {
            event.preventDefault();
            void form.handleSubmit().catch(() => undefined);
          }}
          submitLabel="Sign in"
        >
          <form.Field name="emailOrUsername">
            {(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Email or username</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    autoComplete="username"
                    aria-invalid={isInvalid}
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>
          <form.Field name="password">
            {(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="password"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    autoComplete="current-password"
                    aria-invalid={isInvalid}
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>
          <Link
            href="/forgot-password"
            className="text-sm text-primary underline-offset-4 hover:underline"
          >
            Forgot password?
          </Link>
        </AuthFormCard>
      )}
    </form.Subscribe>
  );
}

function SignupCard() {
  const form = useForm({
    defaultValues: {
      name: "",
      username: "",
      email: "",
      password: "",
    },
    validators: { onSubmit: signUpSchema },
    onSubmit: async ({ value }) => {
      const values = signUpSchema.parse(value);
      const { error } = await signUp
        .email({
          ...values,
          callbackURL: window.location.origin,
        })
        .catch(() => {
          toast.error("Unable to reach the server. Try again.");
          throw new Error("Unable to reach the server");
        });

      if (error) {
        const message = error.message || "Failed to create account";
        toast.error(message);
        throw new Error(message);
      }

      const destination = new URL("/verify-email", window.location.origin);
      destination.searchParams.set("email", values.email);
      window.location.assign(destination);
    },
  });

  return (
    <form.Subscribe selector={(state) => state.isSubmitting}>
      {(isSubmitting) => (
        <AuthFormCard
          title="Create an account"
          description="Start tracking anime and manga on Tsuki."
          action="sign-in"
          isSubmitting={isSubmitting}
          onSubmit={(event) => {
            event.preventDefault();
            void form.handleSubmit().catch(() => undefined);
          }}
          submitLabel="Create account"
        >
          <form.Field name="name">
            {(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Name</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    autoComplete="name"
                    aria-invalid={isInvalid}
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>
          <form.Field name="username">
            {(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Username</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    autoComplete="username"
                    aria-invalid={isInvalid}
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>
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
          <form.Field name="password">
            {(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Password</FieldLabel>
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
  );
}
