"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { revalidateLogic, useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { Edit2, LoaderCircle, Plus, User, X } from "lucide-react";
import { toast } from "sonner";

import type { UserOverview } from "@tsuki/api/types";

import {
  DiscardChangesDialog,
  useDiscardableDialog,
  useUnloadWarning,
} from "@/features/rich-content/components/discard-changes";
import { RichContentEditor } from "@/features/rich-content/components/rich-content-editor";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import { Field, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/shared/components/ui/field";
import { cn } from "@/shared/lib/utils";
import { TextField } from "@/shared/components/text-field";

import type { ImageUploadType } from "../image-utils";
import { updateProfile } from "../actions";
import { createProfileFormValues, createProfileUpdate, profileFormSchema } from "../schemas";
import { ProfileImageControls } from "./profile-image-controls";
import { getSocialPreset, SOCIAL_PRESETS, SocialIcon } from "../social-presets";

export function EditProfileDialog({
  profile,
  avatarImage,
}: {
  profile: UserOverview["profile"];
  avatarImage?: string | null;
}) {
  const router = useRouter();
  const defaultValues = createProfileFormValues(profile, avatarImage);
  const update = useMutation({ mutationFn: updateProfile });

  const form = useForm({
    defaultValues,
    validationLogic: revalidateLogic(),
    validators: { onDynamic: profileFormSchema },
    onSubmit: async ({ value }) => {
      const result = await update
        .mutateAsync(createProfileUpdate(value, defaultValues))
        .catch(() => {
          toast.error("An unexpected error occurred.");
          throw new Error("Failed to update profile");
        });
      if (!result.success) {
        toast.error(result.error);
        throw new Error(result.error);
      }

      toast.success("Profile updated successfully");
      dialog.close();
      router.refresh();
    },
  });
  // Remounts the uncontrolled editor whenever the form resets (open/discard/close).
  const dialog = useDiscardableDialog(form.state.isDirty, () => form.reset(defaultValues));

  useUnloadWarning(form.state.isDirty);

  return (
    <Dialog open={dialog.isOpen} onOpenChange={dialog.handleOpenChange}>
      <DialogTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className="rounded-full border-border/50 transition-colors hover:border-primary/50 hover:bg-primary/10 hover:text-primary"
          >
            <Edit2 data-icon="inline-start" />
            Edit Profile
          </Button>
        }
      />
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
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
                  <form.Field name="bannerImage">
                    {(field) => (
                      <ProfileImageField
                        type="banner"
                        value={field.state.value}
                        onChange={field.handleChange}
                      />
                    )}
                  </form.Field>

                  <div className="-mt-12 px-2">
                    <form.Field name="image">
                      {(field) => (
                        <ProfileImageField
                          type="avatar"
                          value={field.state.value}
                          onChange={field.handleChange}
                        />
                      )}
                    </form.Field>
                  </div>

                  <form.Field name="bio">
                    {(field) => (
                      <Field>
                        <FieldLabel htmlFor="edit-profile-bio">Bio</FieldLabel>
                        <RichContentEditor
                          key={dialog.editorResetKey}
                          preset="bio"
                          value={field.state.value}
                          onChange={(value) => field.handleChange(value)}
                          disabled={isSubmitting}
                          ariaLabel="Bio"
                        />
                      </Field>
                    )}
                  </form.Field>

                  <form.Field name="socialLinks" mode="array">
                    {(socialLinksField) => {
                      const usedPlatforms = new Set(
                        socialLinksField.state.value.map((link) =>
                          link.platform.trim().toLowerCase(),
                        ),
                      );

                      return (
                        <FieldSet>
                          <FieldLegend variant="label">Social Links</FieldLegend>

                          <div className="flex flex-wrap gap-2">
                            {SOCIAL_PRESETS.map((preset) => (
                              <button
                                key={preset.value}
                                type="button"
                                title={`Add ${preset.label} link`}
                                aria-label={`Add ${preset.label} link`}
                                disabled={usedPlatforms.has(preset.value)}
                                className="flex h-9 w-9 items-center justify-center rounded-full border border-border/50 bg-muted/50 text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary disabled:pointer-events-none disabled:opacity-40"
                                onClick={() =>
                                  socialLinksField.pushValue({ platform: preset.value, url: "" })
                                }
                              >
                                <SocialIcon preset={preset} className="h-4 w-4" />
                              </button>
                            ))}
                            <button
                              type="button"
                              title="Add custom link"
                              aria-label="Add custom link"
                              className="flex h-9 w-9 items-center justify-center rounded-full border border-dashed border-border/50 text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
                              onClick={() => socialLinksField.pushValue({ platform: "", url: "" })}
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>

                          <FieldGroup>
                            {socialLinksField.state.value.map((link, index) => {
                              const preset = getSocialPreset(link.platform);

                              return (
                                <FieldGroup
                                  key={index}
                                  className={cn(
                                    "grid items-start gap-2",
                                    preset
                                      ? "grid-cols-[auto_1fr_auto]"
                                      : "grid-cols-[1fr_2fr_auto]",
                                  )}
                                >
                                  {preset ? (
                                    <>
                                      <div className="flex h-9 w-9 items-center justify-center rounded-full border border-border/50 bg-muted/50 text-muted-foreground">
                                        <SocialIcon preset={preset} className="h-4 w-4" />
                                      </div>
                                      <TextField
                                        form={form}
                                        name={`socialLinks[${index}].url`}
                                        label={preset.label}
                                        hideLabel
                                        placeholder={preset.placeholder}
                                        inputMode={preset.prefix ? "text" : "url"}
                                      />
                                    </>
                                  ) : (
                                    <>
                                      <TextField
                                        form={form}
                                        name={`socialLinks[${index}].platform`}
                                        label={`Platform ${index + 1}`}
                                        hideLabel
                                        placeholder="platform"
                                      />
                                      <TextField
                                        form={form}
                                        name={`socialLinks[${index}].url`}
                                        label={`URL ${index + 1}`}
                                        hideLabel
                                        placeholder="d1rshan.me"
                                        inputMode="url"
                                      />
                                    </>
                                  )}

                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="mt-0.5 shrink-0"
                                    onClick={() => socialLinksField.removeValue(index)}
                                    aria-label={`Remove ${link.platform || "social"} link`}
                                  >
                                    <X />
                                  </Button>
                                </FieldGroup>
                              );
                            })}
                          </FieldGroup>
                        </FieldSet>
                      );
                    }}
                  </form.Field>

                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => dialog.handleOpenChange(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">
                      {isSubmitting && (
                        <LoaderCircle data-icon="inline-start" className="animate-spin" />
                      )}
                      Save Changes
                    </Button>
                  </div>
                </FieldGroup>
              </FieldSet>
            )}
          </form.Subscribe>
        </form>
      </DialogContent>
      <DiscardChangesDialog
        open={dialog.isConfirmingClose}
        onDiscard={dialog.discard}
        onKeepEditing={dialog.keepEditing}
      />
    </Dialog>
  );
}

function ProfileImageField({
  type,
  value,
  onChange,
}: {
  type: ImageUploadType;
  value: string | null;
  onChange: (value: string | null) => void;
}) {
  const isBanner = type === "banner";

  if (isBanner) {
    return (
      <div className="relative w-full">
        <div className="relative h-40 w-full overflow-hidden rounded-2xl border">
          {value ? (
            <Image src={value} alt="Banner preview" fill unoptimized className="object-cover" />
          ) : (
            <div className="h-full w-full bg-gradient-to-tr from-muted/50 via-muted/20 to-muted/50" />
          )}
        </div>

        <ProfileImageControls
          type="banner"
          aspectRatio={3}
          cropShape="rect"
          hasImage={Boolean(value)}
          onUploadSuccess={onChange}
          onRemove={() => onChange(null)}
          className="absolute bottom-2 right-2"
        />
      </div>
    );
  }

  return (
    <div className="relative h-24 w-24 shrink-0">
      <div className="relative h-24 w-24 overflow-hidden rounded-full border bg-muted ring-4 ring-background">
        {value ? (
          <Image src={value} alt="Avatar preview" fill className="object-cover" />
        ) : (
          <div className="grid h-full w-full place-items-center text-muted-foreground">
            <User className="h-8 w-8" />
          </div>
        )}
      </div>

      <ProfileImageControls
        type="avatar"
        align="start"
        aspectRatio={1}
        cropShape="round"
        hasImage={Boolean(value)}
        onUploadSuccess={onChange}
        onRemove={() => onChange(null)}
        className="absolute right-0 bottom-0 z-10"
      />
    </div>
  );
}
