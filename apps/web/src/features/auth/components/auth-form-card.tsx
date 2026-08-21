import Link from "next/link";
import { LoaderCircle } from "lucide-react";

import { Button, buttonVariants } from "@/shared/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { FieldGroup, FieldSet } from "@/shared/components/ui/field";

type AuthFormCardProps = {
  action: "sign-in" | "sign-up";
  children: React.ReactNode;
  description: string;
  isSubmitting: boolean;
  onSubmit: React.FormEventHandler<HTMLFormElement>;
  submitLabel: string;
  title: string;
};

export function AuthFormCard({
  action,
  children,
  description,
  isSubmitting,
  onSubmit,
  submitLabel,
  title,
}: AuthFormCardProps) {
  const isSignUpAction = action === "sign-up";

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
        <CardAction>
          <Link
            href={isSignUpAction ? "/login?mode=signup" : "/login"}
            replace
            className={buttonVariants({ variant: "link" })}
          >
            {isSignUpAction ? "Sign up" : "Sign in"}
          </Link>
        </CardAction>
      </CardHeader>
      <form onSubmit={onSubmit} className="flex flex-col gap-(--card-spacing)">
        <CardContent>
          <FieldSet disabled={isSubmitting}>
            <FieldGroup>{children}</FieldGroup>
          </FieldSet>
        </CardContent>
        <CardFooter className="flex-col items-stretch">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <LoaderCircle data-icon="inline-start" className="animate-spin" />}
            {submitLabel}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
