"use client";

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { signIn } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
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
import {
  FieldGroup,
  Field,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

interface LoginCardProps {
  onSwitchToSignUp: () => void;
}

export function LoginCard({ onSwitchToSignUp }: LoginCardProps) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const { error: signInError } = await signIn.email(values);
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
          Enter your email below to login to your account
        </CardDescription>
        <CardAction>
          <Button variant="link" onClick={onSwitchToSignUp}>
            Sign Up
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} id="login-form">
          <FieldGroup>
            <Field data-invalid={!!errors.email}>
              <FieldLabel htmlFor="login-email">Email</FieldLabel>
              <Input
                id="login-email"
                type="email"
                placeholder="m@example.com"
                {...register("email")}
                aria-invalid={!!errors.email}
                disabled={isSubmitting}
              />
              <FieldError errors={errors.email ? [errors.email] : []} />
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
    </Card >
  );
}
