"use client";

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { signUp } from "@/lib/auth-client";
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
import { FieldGroup, Field, FieldLabel, FieldError } from "@/components/ui/field";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be at most 30 characters")
    .regex(/^[a-zA-Z0-9_.]+$/, "Username can only contain letters, numbers, underscores, and dots"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

interface SignUpCardProps {
  onSwitchToLogin: () => void;
}

export function SignUpCard({ onSwitchToLogin }: SignUpCardProps) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      username: "",
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const { error: signUpError } = await signUp.email({
        email: values.email,
        name: values.name,
        password: values.password,
        username: values.username,
      });
      if (signUpError) {
        toast.error(signUpError.message || "Failed to create account");
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
        <CardTitle>Create an account</CardTitle>
        <CardDescription>Enter your details below to create your account</CardDescription>
        <CardAction>
          <Button variant="link" onClick={onSwitchToLogin}>
            Login
          </Button>
        </CardAction>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)} id="signup-form">
        <CardContent>
          <FieldGroup>
            <Field data-invalid={!!errors.name}>
              <FieldLabel htmlFor="signup-name">Name</FieldLabel>
              <Input
                id="signup-name"
                placeholder="John Doe"
                {...register("name")}
                aria-invalid={!!errors.name}
                disabled={isSubmitting}
              />
              <FieldError errors={errors.name ? [errors.name] : []} />
            </Field>
            <Field data-invalid={!!errors.username}>
              <FieldLabel htmlFor="signup-username">Username</FieldLabel>
              <Input
                id="signup-username"
                placeholder="johndoe"
                {...register("username")}
                aria-invalid={!!errors.username}
                disabled={isSubmitting}
              />
              <FieldError errors={errors.username ? [errors.username] : []} />
            </Field>
            <Field data-invalid={!!errors.email}>
              <FieldLabel htmlFor="signup-email">Email</FieldLabel>
              <Input
                id="signup-email"
                type="email"
                placeholder="m@example.com"
                {...register("email")}
                aria-invalid={!!errors.email}
                disabled={isSubmitting}
              />
              <FieldError errors={errors.email ? [errors.email] : []} />
            </Field>
            <Field data-invalid={!!errors.password}>
              <FieldLabel htmlFor="signup-password">Password</FieldLabel>
              <Input
                id="signup-password"
                type="password"
                placeholder="••••••••"
                {...register("password")}
                aria-invalid={!!errors.password}
                disabled={isSubmitting}
              />
              <FieldError errors={errors.password ? [errors.password] : []} />
            </Field>
          </FieldGroup>
        </CardContent>
      </form>
      <CardFooter className="flex-col gap-2">
        <Button type="submit" form="signup-form" className="w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 data-icon="inline-start" className="animate-spin" />}
          Create account
        </Button>
      </CardFooter>
    </Card>
  );
}
