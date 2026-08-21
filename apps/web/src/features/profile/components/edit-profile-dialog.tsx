"use client";

import { useLayoutEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { revalidateLogic, useForm } from "@tanstack/react-form";
import { Edit2, LoaderCircle, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import type { UserOverview } from "@tsuki/api/types";

import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";

import { updateProfile } from "../actions";
import { createProfileUpdate, profileFormSchema, type ProfileFormValues } from "../schemas";

type Profile = UserOverview["profile"];

export function EditProfileDialog({ profile }: { profile: Profile }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const defaultValues = createProfileFormValues(profile);
  const form = useForm({
    defaultValues,
    validationLogic: revalidateLogic(),
    validators: { onDynamic: profileFormSchema },
    onSubmit: async ({ value }) => {
      const result = await updateProfile(createProfileUpdate(value)).catch(() => {
        toast.error("An unexpected error occurred.");
        throw new Error("Failed to update profile");
      });

      if (!result.success) {
        toast.error(result.error);
        throw new Error(result.error);
      }

      toast.success("Profile updated successfully");
      handleOpenChange(false);
      router.refresh();
    },
  });

  useLayoutEffect(() => () => setIsOpen(false), []);

  function handleOpenChange(open: boolean) {
    setIsOpen(open);
    form.reset(defaultValues);
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className="gap-2 rounded-full border-border/50 transition-colors hover:border-primary/50 hover:bg-primary/10 hover:text-primary"
          >
            <Edit2 data-icon="inline-start" />
            Edit Profile
          </Button>
        }
      />
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>

        <form
          id="edit-profile-form"
          className="mt-4"
          onSubmit={(event) => {
            event.preventDefault();
            void form.handleSubmit().catch(() => undefined);
          }}
        >
          <form.Subscribe selector={(state) => state.isSubmitting}>
            {(isSubmitting) => (
              <FieldSet disabled={isSubmitting}>
                <FieldGroup>
                  <form.Field name="bio">
                    {(field) => {
                      const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

                      return (
                        <Field data-invalid={isInvalid}>
                          <FieldLabel htmlFor={field.name}>Bio</FieldLabel>
                          <Textarea
                            id={field.name}
                            name={field.name}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(event) => field.handleChange(event.target.value)}
                            placeholder="Tell us about yourself..."
                            className="resize-none"
                            rows={3}
                            aria-invalid={isInvalid}
                          />
                          {isInvalid && <FieldError errors={field.state.meta.errors} />}
                        </Field>
                      );
                    }}
                  </form.Field>

                  <form.Field name="bannerImage">
                    {(field) => {
                      const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

                      return (
                        <Field data-invalid={isInvalid}>
                          <FieldLabel htmlFor={field.name}>Banner Image URL</FieldLabel>
                          <Input
                            id={field.name}
                            name={field.name}
                            type="url"
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(event) => field.handleChange(event.target.value)}
                            placeholder="https://example.com/banner.jpg"
                            aria-invalid={isInvalid}
                          />
                          {isInvalid && <FieldError errors={field.state.meta.errors} />}
                        </Field>
                      );
                    }}
                  </form.Field>

                  <form.Field name="socialLinks" mode="array">
                    {(socialLinksField) => (
                      <FieldSet className="grid grid-cols-[1fr_auto] items-center">
                        <FieldLegend variant="label" className="mb-0">
                          Social Links
                        </FieldLegend>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => socialLinksField.pushValue({ platform: "", url: "" })}
                        >
                          <Plus data-icon="inline-start" />
                          Add Link
                        </Button>
                        <FieldGroup className="col-span-2">
                          {socialLinksField.state.value.map((link, index) => (
                            <FieldGroup
                              key={index}
                              className="grid grid-cols-[1fr_2fr_auto] items-start gap-2"
                            >
                              <form.Field name={`socialLinks[${index}].platform`}>
                                {(field) => {
                                  const isInvalid =
                                    field.state.meta.isTouched && !field.state.meta.isValid;

                                  return (
                                    <Field data-invalid={isInvalid}>
                                      <FieldLabel htmlFor={field.name} className="sr-only">
                                        Platform {index + 1}
                                      </FieldLabel>
                                      <Input
                                        id={field.name}
                                        name={field.name}
                                        value={field.state.value}
                                        onBlur={field.handleBlur}
                                        onChange={(event) => field.handleChange(event.target.value)}
                                        placeholder="Platform"
                                        aria-invalid={isInvalid}
                                      />
                                      {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                    </Field>
                                  );
                                }}
                              </form.Field>
                              <form.Field name={`socialLinks[${index}].url`}>
                                {(field) => {
                                  const isInvalid =
                                    field.state.meta.isTouched && !field.state.meta.isValid;

                                  return (
                                    <Field data-invalid={isInvalid}>
                                      <FieldLabel htmlFor={field.name} className="sr-only">
                                        URL {index + 1}
                                      </FieldLabel>
                                      <Input
                                        id={field.name}
                                        name={field.name}
                                        type="url"
                                        value={field.state.value}
                                        onBlur={field.handleBlur}
                                        onChange={(event) => field.handleChange(event.target.value)}
                                        placeholder="https://x.com/..."
                                        aria-invalid={isInvalid}
                                      />
                                      {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                    </Field>
                                  );
                                }}
                              </form.Field>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="mt-0.5 shrink-0 text-destructive"
                                onClick={() => socialLinksField.removeValue(index)}
                                aria-label={`Remove ${link.platform || "social"} link`}
                              >
                                <Trash2 />
                              </Button>
                            </FieldGroup>
                          ))}
                        </FieldGroup>
                      </FieldSet>
                    )}
                  </form.Field>
                </FieldGroup>

                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="ghost" onClick={() => handleOpenChange(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {isSubmitting && (
                      <LoaderCircle data-icon="inline-start" className="animate-spin" />
                    )}
                    Save Changes
                  </Button>
                </div>
              </FieldSet>
            )}
          </form.Subscribe>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function createProfileFormValues(profile: Profile): ProfileFormValues {
  return {
    bio: profile?.bio || "",
    bannerImage: profile?.bannerImage || "",
    socialLinks: Object.entries(profile?.socialLinks ?? {}).map(([platform, url]) => ({
      platform,
      url,
    })),
  };
}
