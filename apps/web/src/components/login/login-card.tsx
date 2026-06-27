"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { signIn } from "@tsuki/auth/client";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FieldGroup, Field, FieldLabel, FieldError } from "@/components/ui/field";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  emailOrUsername: z.string().min(1, "Email or username is required"),
  password: z.string().min(1, "Password is required"),
});

export function LoginCard() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      emailOrUsername: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const isEmail = values.emailOrUsername.includes("@");
      const { error: signInError } = isEmail
        ? await signIn.email({ email: values.emailOrUsername, password: values.password })
        : await signIn.username({ username: values.emailOrUsername, password: values.password });

      if (signInError) {
        toast.error(signInError.message || "Failed to sign in");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch {
      toast.error("An unexpected error occurred");
    }
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Login to your account</CardTitle>
        <CardDescription>
          Enter your email or username below to login to your account
        </CardDescription>
        <CardAction>
          <Link href="/login?mode=signup" replace className={buttonVariants({ variant: "link" })}>
            Sign Up
          </Link>
        </CardAction>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} id="login-form">
          <FieldGroup>
            <Field data-invalid={!!errors.emailOrUsername}>
              <FieldLabel htmlFor="login-email">Email or Username</FieldLabel>
              <Input
                id="login-email"
                type="text"
                placeholder="m@example.com"
                {...register("emailOrUsername")}
                aria-invalid={!!errors.emailOrUsername}
                disabled={isSubmitting}
              />
              <FieldError errors={errors.emailOrUsername ? [errors.emailOrUsername] : []} />
            </Field>
            <Field data-invalid={!!errors.password}>
              <FieldLabel htmlFor="login-password">Password</FieldLabel>
              <Input
                id="login-password"
                type="password"
                placeholder="••••••••"
                {...register("password")}
                aria-invalid={!!errors.password}
                disabled={isSubmitting}
              />
              <FieldError errors={errors.password ? [errors.password] : []} />
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <Button type="submit" form="login-form" className="w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 data-icon="inline-start" className="animate-spin" />}
          Sign in
        </Button>
      </CardFooter>
    </Card>
  );
}
