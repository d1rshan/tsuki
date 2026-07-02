"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Edit2, Plus, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FieldGroup, Field, FieldLabel, FieldError } from "@/components/ui/field";
import type { UserOverview } from "@/lib/types";

import { updateProfile } from "./actions";

const formSchema = z.object({
  bio: z.string().max(500, "Bio must be at most 500 characters").optional(),
  bannerImage: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  accentColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color code")
    .optional()
    .or(z.literal("")),
  socialLinks: z
    .array(
      z.object({
        platform: z.string().min(1, "Platform is required"),
        url: z.string().url("Must be a valid URL"),
      }),
    )
    .optional(),
});

type Profile = UserOverview["profile"];

export function EditProfileDialog({ profile }: { profile: Profile }) {
  const router = useRouter();
  const params = useParams();
  const username = params.username as string;
  const [isOpen, setIsOpen] = useState(false);

  // Convert Record<string, string> to array for react-hook-form
  const initialSocialLinks = Object.entries(profile?.socialLinks ?? {}).map(([platform, url]) => ({
    platform,
    url: url as string,
  }));

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bio: profile?.bio || "",
      bannerImage: profile?.bannerImage || "",
      accentColor: profile?.accentColor || "#1f1f1f",
      socialLinks: initialSocialLinks,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "socialLinks",
  });

  const accentColorValue = watch("accentColor");

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const socialLinksRecord = values.socialLinks?.reduce(
        (acc, curr) => {
          if (curr.platform && curr.url) {
            acc[curr.platform.toLowerCase()] = curr.url;
          }
          return acc;
        },
        {} as Record<string, string>,
      );

      const res = await updateProfile(
        {
          bio: values.bio || null,
          bannerImage: values.bannerImage || null,
          accentColor: values.accentColor || null,
          socialLinks: Object.keys(socialLinksRecord || {}).length ? socialLinksRecord! : null,
        },
        username,
      );

      if (!res.success) {
        toast.error(res.error);
        return;
      }

      toast.success("Profile updated successfully");
      setIsOpen(false);
      router.refresh();
    } catch {
      toast.error("An unexpected error occurred.");
    }
  }

  // Handle dialog open state to reset form
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      reset(); // Reset to default values when closed
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className="gap-2 rounded-full border-border/50 hover:border-primary/50 hover:bg-primary/10 hover:text-primary transition-colors"
          >
            <Edit2 className="w-4 h-4" />
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
                  value={accentColorValue || "#000000"}
                  onChange={(e) =>
                    setValue("accentColor", e.target.value, { shouldValidate: true })
                  }
                  className="w-12 h-12 p-1 cursor-pointer"
                  disabled={isSubmitting}
                />
                <Input
                  id="accentColor"
                  type="text"
                  placeholder="#000000"
                  className="font-mono uppercase flex-1"
                  value={accentColorValue || ""}
                  onChange={(e) =>
                    setValue("accentColor", e.target.value, {
                      shouldValidate: true,
                      shouldDirty: true,
                    })
                  }
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
                  <Plus className="w-4 h-4 mr-1" /> Add Link
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
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </FieldGroup>

          <div className="flex justify-end gap-2 pt-6">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" form="edit-profile-form" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 data-icon="inline-start" className="w-4 h-4 mr-2 animate-spin" />
              )}
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
