"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import { useForm } from "react-hook-form";
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
} from "@/components/ui/dialog";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

import { finishUsernameChange } from "../actions";
import { usernameFormSchema, type UsernameFormValues } from "../schemas";

type ChangeUsernameDialogProps = {
  displayUsername: string;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  username: string;
};

type UsernameAvailability = "available" | "checking" | null;

type UsernameChangeError = {
  code?: string;
  message?: string;
};

function getUsernameChangeError(error: UsernameChangeError): string {
  if (error.code === "USERNAME_CHANGE_COOLDOWN") {
    return (
      error.message ??
      "You can change your username once every 7 days. Please try again after your cooldown ends."
    );
  }

  if (error.code === "USERNAME_IS_ALREADY_TAKEN") return "That username is already taken.";

  return error.message ?? "Unable to change your username.";
}

export function ChangeUsernameDialog({
  displayUsername,
  onOpenChange,
  open,
  username,
}: ChangeUsernameDialogProps) {
  const [availability, setAvailability] = useState<UsernameAvailability>(null);
  const {
    register,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    getValues,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<UsernameFormValues>({
    resolver: zodResolver(usernameFormSchema),
    defaultValues: { username: displayUsername },
  });

  function handleOpenChange(open: boolean) {
    onOpenChange(open);
    if (!open) {
      setAvailability(null);
      reset({ username: displayUsername });
    }
  }

  async function checkAvailability() {
    if (!(await trigger("username"))) {
      setAvailability(null);
      return;
    }

    const newUsername = getValues("username").trim();
    if (newUsername.toLowerCase() === username) {
      setAvailability(null);
      return;
    }

    setAvailability("checking");
    const { data, error: availabilityError } = await authClient.isUsernameAvailable({
      username: newUsername,
    });

    if (availabilityError) {
      setAvailability(null);
      return;
    }

    if (getValues("username").trim() !== newUsername) return;

    if (data?.available) {
      setAvailability("available");
    } else {
      setAvailability(null);
      setError("username", { message: "That username is already taken." });
    }
  }

  async function onSubmit({ username: newUsername }: UsernameFormValues) {
    if (newUsername.toLowerCase() === username && newUsername === displayUsername) {
      handleOpenChange(false);
      return;
    }

    try {
      const { error: updateError } = await authClient.updateUser({
        displayUsername: newUsername,
        username: newUsername,
      });

      if (updateError) {
        setError("username", { message: getUsernameChangeError(updateError) });
        return;
      }

      toast.success("Username updated successfully.");
      await finishUsernameChange(username, newUsername);
    } catch {
      setError("username", { message: "Unable to change your username. Try again." });
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change username</DialogTitle>
          <DialogDescription>
            Your profile URL and sign-in username will change. You can change your username once
            every 7 days.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} id="change-username-form">
          <FieldGroup>
            <Field data-invalid={Boolean(errors.username)}>
              <FieldLabel htmlFor="username">Username</FieldLabel>
              <Input
                id="username"
                autoComplete="username"
                {...register("username", {
                  onBlur: () => void checkAvailability(),
                  onChange: () => {
                    setAvailability(null);
                    clearErrors("username");
                  },
                })}
                aria-invalid={Boolean(errors.username)}
                disabled={isSubmitting}
              />
              {availability === "checking" ? (
                <FieldDescription aria-live="polite">Checking availability…</FieldDescription>
              ) : null}
              {availability === "available" ? (
                <FieldDescription aria-live="polite">Username is available.</FieldDescription>
              ) : null}
              <FieldError errors={errors.username ? [errors.username] : []} />
            </Field>
          </FieldGroup>
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
            {isSubmitting ? (
              <LoaderCircle data-icon="inline-start" className="animate-spin" />
            ) : null}
            Save username
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
