import { z } from "zod";

import { usernameSchema } from "@/shared/lib/username";

const httpUrl = z.url("Enter a valid URL").refine((value) => /^https?:\/\//i.test(value), {
  message: "URL must start with http:// or https://",
});
const optionalHttpUrl = z.union([httpUrl, z.literal("")]);

export const profileFormSchema = z.object({
  bio: z.string().max(500, "Bio must be at most 500 characters"),
  bannerImage: optionalHttpUrl,
  accentColor: z.union([
    z.string().regex(/^#[\da-f]{6}$/i, "Enter a six-digit hex color"),
    z.literal(""),
  ]),
  socialLinks: z.array(
    z.object({
      platform: z.string().trim().min(1, "Platform is required"),
      url: httpUrl,
    }),
  ),
});

export const usernameFormSchema = z.object({
  username: usernameSchema,
});

export const profileUpdateSchema = z.object({
  bio: z.string().max(500).nullable(),
  bannerImage: httpUrl.nullable(),
  accentColor: z
    .string()
    .regex(/^#[\da-f]{6}$/i)
    .nullable(),
  socialLinks: z.record(z.string(), httpUrl).nullable(),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;
export type ProfileUpdate = z.infer<typeof profileUpdateSchema>;
export type UsernameFormValues = z.infer<typeof usernameFormSchema>;

export function createProfileUpdate(values: ProfileFormValues): ProfileUpdate {
  const socialLinks = Object.fromEntries(
    values.socialLinks.map(({ platform, url }) => [platform.trim().toLowerCase(), url]),
  );

  return {
    bio: values.bio.trim() || null,
    bannerImage: values.bannerImage || null,
    accentColor: values.accentColor || null,
    socialLinks: Object.keys(socialLinks).length ? socialLinks : null,
  };
}
