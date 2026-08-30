import { z } from "zod";

import type { RichContent } from "@tsuki/rich-content";
import { isEmptyRichContent } from "@tsuki/rich-content";

const httpUrl = z.url("Enter a valid URL").refine((value) => /^https?:\/\//i.test(value), {
  message: "URL must start with http:// or https://",
});

// Deep Rich Content policy is enforced by the API; the form passes it through.
const richContent = z.custom<RichContent | null>(() => true);

export const profileFormSchema = z.object({
  bio: richContent,
  socialLinks: z.array(
    z.object({
      platform: z.string().trim().min(1, "Platform is required"),
      url: httpUrl,
    }),
  ),
});

export const profileUpdateSchema = z.object({
  image: httpUrl.nullable().optional(),
  bannerImage: httpUrl.nullable().optional(),
  bio: richContent.nullable().optional(),
  socialLinks: z.record(z.string(), httpUrl).nullable().optional(),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;
export type ProfileUpdate = z.infer<typeof profileUpdateSchema>;

export function createProfileUpdate(values: ProfileFormValues): ProfileUpdate {
  const socialLinks = Object.fromEntries(
    values.socialLinks.map(({ platform, url }) => [platform.trim().toLowerCase(), url]),
  );

  return {
    bio: values.bio && !isEmptyRichContent(values.bio) ? values.bio : null,
    socialLinks: Object.keys(socialLinks).length ? socialLinks : null,
  };
}
