import Link from "next/link";
import { LoaderCircle } from "lucide-react";

import type { AnyForm } from "@/shared/components/text-field";

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

export function AuthFormCard({
  action,
  children,
  description,
  form,
  submitLabel,
  title,
}: {
  action: "sign-in" | "sign-up";
  children: React.ReactNode;
  description: string;
  form: AnyForm;
  submitLabel: string;
  title: string;
}) {
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
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void form.handleSubmit().catch(() => undefined);
        }}
        className="flex flex-col gap-(--card-spacing)"
      >
        {/* ponytail: loose seam — concrete useForm generics resist widening */}
        <form.Subscribe
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          selector={(state: any) => state.isSubmitting}
        >
          {(isSubmitting: boolean) => (
            <>
              <CardContent>
                <FieldSet disabled={isSubmitting}>
                  <FieldGroup>{children}</FieldGroup>
                </FieldSet>
              </CardContent>
              <CardFooter className="flex-col items-stretch">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && (
                    <LoaderCircle data-icon="inline-start" className="animate-spin" />
                  )}
                  {submitLabel}
                </Button>
              </CardFooter>
            </>
          )}
        </form.Subscribe>
      </form>
    </Card>
  );
}
