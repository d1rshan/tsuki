import Link from "next/link";
import { LoaderCircle } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type AuthFormCardProps = {
  alternateHref: string;
  alternateLabel: string;
  children: React.ReactNode;
  description: string;
  formId: string;
  isSubmitting: boolean;
  onSubmit: React.FormEventHandler<HTMLFormElement>;
  submitLabel: string;
  title: string;
};

export function AuthFormCard({
  alternateHref,
  alternateLabel,
  children,
  description,
  formId,
  isSubmitting,
  onSubmit,
  submitLabel,
  title,
}: AuthFormCardProps) {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
        <CardAction>
          <Link href={alternateHref} replace className={buttonVariants({ variant: "link" })}>
            {alternateLabel}
          </Link>
        </CardAction>
      </CardHeader>
      <form id={formId} onSubmit={onSubmit}>
        <CardContent>{children}</CardContent>
      </form>
      <CardFooter>
        <Button type="submit" form={formId} className="w-full" disabled={isSubmitting}>
          {isSubmitting ? <LoaderCircle className="animate-spin" /> : null}
          {submitLabel}
        </Button>
      </CardFooter>
    </Card>
  );
}
