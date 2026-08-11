"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";

import { authClient } from "@tsuki/auth/client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { usernameSchema } from "@/shared/lib/username";

import { invalidateRenamedProfile } from "../actions";

import { profilePathForUsername } from "./username-change";

type Availability = "available" | "checking" | "idle" | "unavailable";

type ChangeUsernameDialogProps = {
  displayUsername: string;
  username: string;
};

export function ChangeUsernameDialog({ displayUsername, username }: ChangeUsernameDialogProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [value, setValue] = useState(displayUsername);
  const [availability, setAvailability] = useState<Availability>("idle");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function reset() {
    setAvailability("idle");
    setError(null);
    setValue(displayUsername);
  }

  function handleOpenChange(open: boolean) {
    setIsOpen(open);
    if (!open) reset();
  }

  async function checkAvailability() {
    const result = usernameSchema.safeParse(value);
    if (!result.success || result.data.toLowerCase() === username) return;

    setAvailability("checking");
    const { data, error: availabilityError } = await authClient.isUsernameAvailable({
      username: result.data,
    });

    if (availabilityError) {
      setAvailability("idle");
      return;
    }

    setAvailability(data?.available ? "available" : "unavailable");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const result = usernameSchema.safeParse(value);
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? "Enter a valid username.");
      return;
    }

    if (result.data.toLowerCase() === username && result.data === displayUsername) {
      handleOpenChange(false);
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const { error: updateError } = await authClient.updateUser({
        displayUsername: result.data,
        username: result.data,
      });

      if (updateError) {
        setError(
          updateError.code === "USERNAME_IS_ALREADY_TAKEN"
            ? "That username is already taken."
            : updateError.message || "Unable to change your username.",
        );
        return;
      }

      await invalidateRenamedProfile(username);
      toast.success("Username updated successfully.");
      handleOpenChange(false);
      router.replace(profilePathForUsername(result.data));
      router.refresh();
    } catch {
      setError("Unable to change your username. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const availabilityMessage =
    availability === "available"
      ? "Username is available."
      : availability === "checking"
        ? "Checking availability…"
        : availability === "unavailable"
          ? "That username is already taken."
          : null;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>Change Username</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change username</DialogTitle>
          <DialogDescription>
            Your profile URL and sign-in username will change. To protect usernames, changes are
            limited.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} id="change-username-form" className="space-y-4">
          <Field data-invalid={Boolean(error)}>
            <FieldLabel htmlFor="username">Username</FieldLabel>
            <Input
              id="username"
              autoComplete="username"
              value={value}
              onBlur={checkAvailability}
              onChange={(event) => {
                setAvailability("idle");
                setError(null);
                setValue(event.target.value);
              }}
              aria-invalid={Boolean(error)}
              disabled={isSubmitting}
            />
            {availabilityMessage ? (
              <p
                className={
                  availability === "available"
                    ? "text-sm text-emerald-600"
                    : "text-sm text-muted-foreground"
                }
              >
                {availabilityMessage}
              </p>
            ) : null}
            <FieldError errors={error ? [{ message: error }] : []} />
          </Field>
        </form>

        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            onClick={() => handleOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" form="change-username-form" disabled={isSubmitting}>
            {isSubmitting ? <LoaderCircle className="animate-spin" /> : null}
            Save username
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
