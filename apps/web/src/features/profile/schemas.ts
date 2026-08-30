import { z } from "zod";

import type { RichContent } from "@tsuki/rich-content";
import { isEmptyRichContent } from "@tsuki/rich-content";

const httpUrl = z.url("Enter a valid URL").refine((value) => /^https?:\/\//i.test(value), {
  message: "URL must start with http:// or https://",
});
const optionalHttpUrl = z.union([httpUrl, z.literal("")]);

// Deep Rich Content policy is enforced by the API; the form passes it through.
const richContent = z.custom<RichContent | null>(() => true);

export const profileFormSchema = z.object({
  image: optionalHttpUrl.nullable().optional(),
  bannerImage: optionalHttpUrl.nullable().optional(),
  bio: richContent,
  socialLinks: z.array(
    z.object({
      platform: z.string().trim().min(1, "Platform is required"),
      url: httpUrl,
    }),
  ),
  avatarFileId: z.string().nullable().optional(),
  bannerFileId: z.string().nullable().optional(),
});

export const profileUpdateSchema = z.object({
  image: httpUrl.nullable().optional(),
  bannerImage: httpUrl.nullable().optional(),
  bio: richContent.nullable().optional(),
  socialLinks: z.record(z.string(), httpUrl).nullable().optional(),
  avatarFileId: z.string().nullable().optional(),
  bannerFileId: z.string().nullable().optional(),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;
export type ProfileUpdate = z.infer<typeof profileUpdateSchema>;

export function createProfileUpdate(values: ProfileFormValues): ProfileUpdate {
  const socialLinks = Object.fromEntries(
    values.socialLinks.map(({ platform, url }) => [platform.trim().toLowerCase(), url]),
  );

  return {
    image:
      values.image !== undefined
        ? values.image && values.image.trim() !== ""
          ? values.image
          : null
        : undefined,
    bannerImage:
      values.bannerImage !== undefined
        ? values.bannerImage && values.bannerImage.trim() !== ""
          ? values.bannerImage
          : null
        : undefined,
    bio: values.bio && !isEmptyRichContent(values.bio) ? values.bio : null,
    socialLinks: Object.keys(socialLinks).length ? socialLinks : null,
  };
}
