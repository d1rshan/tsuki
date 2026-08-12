"use client";

import { useLayoutEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Edit2, LoaderCircle, Plus, Trash2 } from "lucide-react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import type { UserOverview } from "@tsuki/api/types";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { updateProfile } from "../actions";
import { createProfileUpdate, profileFormSchema, type ProfileFormValues } from "../schemas";
import { ChangeUsernameDialog } from "./change-username-dialog";

type Profile = UserOverview["profile"];
type User = UserOverview["user"];

type EditProfileDialogProps = {
  profile: Profile;
  user: User;
};

export function EditProfileDialog({ profile, user }: EditProfileDialogProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isUsernameDialogOpen, setIsUsernameDialogOpen] = useState(false);

  const defaultValues = createProfileFormValues(profile);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isDirty, isSubmitting },
    reset,
    setValue,
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "socialLinks",
  });

  const accentColorValue = useWatch({ control, name: "accentColor" });

  useLayoutEffect(() => () => setIsOpen(false), []);

  async function onSubmit(values: ProfileFormValues) {
    try {
      const res = await updateProfile(createProfileUpdate(values));

      if (!res.success) {
        toast.error(res.error);
        return;
      }

      toast.success("Profile updated successfully");
      handleOpenChange(false);
      router.refresh();
    } catch {
      toast.error("An unexpected error occurred.");
    }
  }

  function handleOpenChange(open: boolean) {
    setIsOpen(open);
    reset(defaultValues);
  }

  function openUsernameDialog() {
    if (isDirty && !window.confirm("Discard unsaved profile changes?")) return;

    handleOpenChange(false);
    setIsUsernameDialogOpen(true);
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className="gap-2 rounded-full border-border/50 hover:border-primary/50 hover:bg-primary/10 hover:text-primary transition-colors"
          >
            <Edit2 className="h-4 w-4" />
            Edit Profile
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} id="edit-profile-form" className="mt-4">
          <FieldGroup>
            <Field data-invalid={!!errors.bio}>
              <FieldLabel htmlFor="bio">Bio</FieldLabel>
              <Textarea
                id="bio"
                placeholder="Tell us about yourself..."
                {...register("bio")}
                className="resize-none"
                rows={3}
                aria-invalid={!!errors.bio}
                disabled={isSubmitting}
              />
              <FieldError errors={errors.bio ? [errors.bio] : []} />
            </Field>

            <Field data-invalid={!!errors.bannerImage}>
              <FieldLabel htmlFor="bannerImage">Banner Image URL</FieldLabel>
              <Input
                id="bannerImage"
                type="url"
                placeholder="https://example.com/banner.jpg"
                {...register("bannerImage")}
                aria-invalid={!!errors.bannerImage}
                disabled={isSubmitting}
              />
              <FieldError errors={errors.bannerImage ? [errors.bannerImage] : []} />
            </Field>

            <Field data-invalid={!!errors.accentColor}>
              <FieldLabel htmlFor="accentColor">Accent Color</FieldLabel>
              <div className="flex items-center gap-3">
                <Input
                  id="accentColorPicker"
                  type="color"
                  aria-label="Choose accent color"
                  value={accentColorValue || "#000000"}
                  onChange={(e) =>
                    setValue("accentColor", e.target.value, {
                      shouldValidate: true,
                      shouldDirty: true,
                    })
                  }
                  className="w-12 h-12 p-1 cursor-pointer"
                  disabled={isSubmitting}
                />
                <Input
                  id="accentColor"
                  type="text"
                  placeholder="#000000"
                  className="font-mono uppercase flex-1"
                  {...register("accentColor")}
                  aria-invalid={!!errors.accentColor}
                  disabled={isSubmitting}
                />
              </div>
              <FieldError errors={errors.accentColor ? [errors.accentColor] : []} />
            </Field>

            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <FieldLabel className="mb-0">Social Links</FieldLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ platform: "", url: "" })}
                  disabled={isSubmitting}
                >
                  <Plus className="mr-1 h-4 w-4" /> Add Link
                </Button>
              </div>

              {fields.map((field, index) => (
                <div key={field.id} className="flex items-start gap-2">
                  <Field data-invalid={!!errors.socialLinks?.[index]?.platform} className="w-1/3">
                    <Input
                      placeholder="Platform"
                      {...register(`socialLinks.${index}.platform`)}
                      aria-invalid={!!errors.socialLinks?.[index]?.platform}
                      disabled={isSubmitting}
                    />
                    <FieldError
                      errors={
                        errors.socialLinks?.[index]?.platform
                          ? [errors.socialLinks?.[index]?.platform]
                          : []
                      }
                    />
                  </Field>
                  <Field data-invalid={!!errors.socialLinks?.[index]?.url} className="flex-1">
                    <Input
                      placeholder="URL (e.g. https://x.com/...)"
                      type="url"
                      {...register(`socialLinks.${index}.url`)}
                      aria-invalid={!!errors.socialLinks?.[index]?.url}
                      disabled={isSubmitting}
                    />
                    <FieldError
                      errors={
                        errors.socialLinks?.[index]?.url ? [errors.socialLinks?.[index]?.url] : []
                      }
                    />
                  </Field>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-destructive shrink-0 mt-0.5"
                    onClick={() => remove(index)}
                    disabled={isSubmitting}
                    aria-label={`Remove ${field.platform || "social"} link`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </FieldGroup>

          <div className="flex items-center justify-between gap-2 pt-6">
            <Button
              type="button"
              variant="ghost"
              onClick={openUsernameDialog}
              disabled={isSubmitting}
            >
              Change username
            </Button>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => handleOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" form="edit-profile-form" disabled={isSubmitting}>
                {isSubmitting ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : null}
                Save Changes
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
      <ChangeUsernameDialog
        displayUsername={user.displayUsername}
        username={user.username}
        open={isUsernameDialogOpen}
        onOpenChange={setIsUsernameDialogOpen}
      />
    </Dialog>
  );
}

function createProfileFormValues(profile: Profile): ProfileFormValues {
  return {
    bio: profile?.bio || "",
    bannerImage: profile?.bannerImage || "",
    accentColor: profile?.accentColor || "",
    socialLinks: Object.entries(profile?.socialLinks ?? {}).map(([platform, url]) => ({
      platform,
      url,
    })),
  };
}
