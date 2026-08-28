"use client";

import { useRouter } from "next/navigation";
import { revalidateLogic, useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { Edit2, LoaderCircle, Plus, Trash2 } from "lucide-react";
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
import { TextField } from "@/shared/components/text-field";

import { updateProfile } from "../actions";
import { createProfileUpdate, profileFormSchema, type ProfileFormValues } from "../schemas";
import { ProfileImageUploader } from "./profile-image-uploader";

export function EditProfileDialog({
  profile,
  user,
}: {
  profile: UserOverview["profile"];
  user?: UserOverview["user"];
}) {
  const router = useRouter();
  const defaultValues = createProfileFormValues(profile, user);
  const update = useMutation({ mutationFn: updateProfile });

  const form = useForm({
    defaultValues,
    validationLogic: revalidateLogic(),
    validators: { onDynamic: profileFormSchema },
    onSubmit: async ({ value }) => {
      const result = await update.mutateAsync(createProfileUpdate(value)).catch(() => {
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
                  <form.Field name="image">
                    {(field) => (
                      <Field>
                        <FieldLabel>Avatar</FieldLabel>
                        <ProfileImageUploader
                          type="avatar"
                          initials={user?.displayUsername || user?.name || "U"}
                          currentImageUrl={field.state.value}
                          disabled={isSubmitting}
                          onImageChange={({ url, fileId }) => {
                            field.handleChange(url);
                            if (fileId) {
                              form.setFieldValue("oldAvatarFileId", fileId);
                            }
                          }}
                        />
                      </Field>
                    )}
                  </form.Field>

                  <form.Field name="bannerImage">
                    {(field) => (
                      <Field>
                        <FieldLabel>Banner</FieldLabel>
                        <ProfileImageUploader
                          type="banner"
                          currentImageUrl={field.state.value}
                          disabled={isSubmitting}
                          onImageChange={({ url, fileId }) => {
                            field.handleChange(url);
                            if (fileId) {
                              form.setFieldValue("oldBannerFileId", fileId);
                            }
                          }}
                        />
                      </Field>
                    )}
                  </form.Field>

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
                              <TextField
                                form={form}
                                name={`socialLinks[${index}].platform`}
                                label={`Platform ${index + 1}`}
                                hideLabel
                                placeholder="Platform"
                              />
                              <TextField
                                form={form}
                                name={`socialLinks[${index}].url`}
                                label={`URL ${index + 1}`}
                                hideLabel
                                type="url"
                                placeholder="https://x.com/..."
                              />
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

function createProfileFormValues(
  profile: UserOverview["profile"],
  user?: UserOverview["user"],
): ProfileFormValues {
  return {
    image: user?.image || "",
    bannerImage: profile?.bannerImage || "",
    bio: profile?.bio ?? null,
    socialLinks: Object.entries(profile?.socialLinks ?? {}).map(([platform, url]) => ({
      platform,
      url,
    })),
    oldAvatarFileId: undefined,
    oldBannerFileId: undefined,
  };
}
