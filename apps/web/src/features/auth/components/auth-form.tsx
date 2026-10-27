import { LoaderCircle, LogIn } from "lucide-react";

import type { AnyForm } from "@/shared/components/text-field";
import { Button } from "@/shared/components/ui/button";
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { FieldGroup, FieldSet } from "@/shared/components/ui/field";

import { useAuthDialog } from "../hooks/use-auth-dialog";

export function AuthForm({
  action,
  children,
  compactSubmit = false,
  description,
  form,
  showHeader = true,
  submitLabel,
  title,
}: {
  action?: "sign-in" | "sign-up";
  children: React.ReactNode;
  compactSubmit?: boolean;
  description?: string;
  form: AnyForm;
  showHeader?: boolean;
  submitLabel: string;
  title: string;
}) {
  const { openAuth } = useAuthDialog();

  return (
    <form
      className="grid gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        void form.handleSubmit().catch(() => undefined);
      }}
    >
      {showHeader && (
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? (
            <DialogDescription>{description}</DialogDescription>
          ) : (
            <DialogDescription className="sr-only">Request a password reset.</DialogDescription>
          )}
        </DialogHeader>
      )}
      <form.Subscribe
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        selector={(state: any) => state.isSubmitting}
      >
        {(isSubmitting: boolean) => (
          <>
            <FieldSet disabled={isSubmitting}>
              <FieldGroup className="gap-3">{children}</FieldGroup>
            </FieldSet>
            {compactSubmit ? (
              <div className="flex items-center justify-between gap-2">
                {action && (
                  <Button type="button" variant="link" onClick={() => openAuth({ mode: action })}>
                    {action === "sign-up" ? "Sign up" : "Log in"}
                  </Button>
                )}
                <Button
                  type="submit"
                  variant="secondary"
                  size="icon"
                  className="size-10.5 rounded-full"
                  aria-label={submitLabel}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <LoaderCircle className="animate-spin" /> : <LogIn />}
                </Button>
              </div>
            ) : (
              <DialogFooter className="border-0 bg-transparent pt-0 sm:flex-col-reverse">
                {action && (
                  <Button type="button" variant="link" onClick={() => openAuth({ mode: action })}>
                    {action === "sign-up" ? "Create account" : "Back to sign in"}
                  </Button>
                )}
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting && (
                    <LoaderCircle data-icon="inline-start" className="animate-spin" />
                  )}
                  {submitLabel}
                </Button>
              </DialogFooter>
            )}
          </>
        )}
      </form.Subscribe>
    </form>
  );
}
