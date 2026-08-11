"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

import { invalidateRenamedProfile } from "../actions";
import { usernameFormSchema, type UsernameFormValues } from "../schemas";

type ChangeUsernameDialogProps = {
  displayUsername: string;
  username: string;
};

type UsernameAvailability = "available" | "checking" | "idle" | "unavailable";

type UsernameChangeError = {
  code?: string;
  message?: string;
  status?: number;
};

export function ChangeUsernameDialog({ displayUsername, username }: ChangeUsernameDialogProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [availability, setAvailability] = useState<UsernameAvailability>("idle");
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

  function usernameChangeErrorMessage(error: UsernameChangeError): string {
    if (error.status === 429) {
      return "You can change your username once every 7 days. Please try again after your cooldown ends.";
    }

    if (error.code === "USERNAME_IS_ALREADY_TAKEN") return "That username is already taken.";

    return error.message || "Unable to change your username.";
  }

  function usernameAvailabilityMessage(): string | null {
    switch (availability) {
      case "available":
        return "Username is available.";
      case "checking":
        return "Checking availability…";
      case "unavailable":
        return "That username is already taken.";
      case "idle":
        return null;
    }
  }

  function handleOpenChange(open: boolean) {
    setIsOpen(open);
    if (!open) {
      setAvailability("idle");
      reset({ username: displayUsername });
    }
  }

  async function checkAvailability() {
    if (!(await trigger("username"))) {
      setAvailability("idle");
      return;
    }

    const newUsername = getValues("username").trim();
    if (newUsername.toLowerCase() === username) {
      setAvailability("idle");
      return;
    }

    setAvailability("checking");
    const { data, error: availabilityError } = await authClient.isUsernameAvailable({
      username: newUsername,
    });

    if (availabilityError) {
      setAvailability("idle");
      return;
    }

    if (getValues("username").trim() !== newUsername) return;

    setAvailability(data?.available ? "available" : "unavailable");
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
        setError("username", { message: usernameChangeErrorMessage(updateError) });
        return;
      }

      await invalidateRenamedProfile(username);
      toast.success("Username updated successfully.");
      handleOpenChange(false);
      router.replace(`/profile/${newUsername.toLowerCase()}`);
    } catch {
      setError("username", { message: "Unable to change your username. Try again." });
    }
  }

  const availabilityMessage = usernameAvailabilityMessage();

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>Change Username</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change username</DialogTitle>
          <DialogDescription>
            Your profile URL and sign-in username will change. You can change your username once
            every 7 days.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} id="change-username-form" className="space-y-4">
          <Field data-invalid={Boolean(errors.username)}>
            <FieldLabel htmlFor="username">Username</FieldLabel>
            <Input
              id="username"
              autoComplete="username"
              {...register("username", {
                onBlur: () => void checkAvailability(),
                onChange: () => {
                  setAvailability("idle");
                  clearErrors("username");
                },
              })}
              aria-invalid={Boolean(errors.username)}
              disabled={isSubmitting}
            />
            {availabilityMessage ? (
              <p
                className={
                  availability === "available"
                    ? "text-sm text-emerald-600"
                    : "text-sm text-muted-foreground"
                }
                aria-live="polite"
              >
                {availabilityMessage}
              </p>
            ) : null}
            <FieldError errors={errors.username ? [errors.username] : []} />
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
