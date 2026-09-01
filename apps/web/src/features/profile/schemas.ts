import { z } from "zod";

import type { UserOverview } from "@tsuki/api/types";
import type { RichContent } from "@tsuki/rich-content";
import { isEmptyRichContent } from "@tsuki/rich-content";

import { getSocialPreset } from "./social-presets";

const httpUrl = z.url("Enter a valid URL").refine((value) => /^https?:\/\//i.test(value), {
  message: "URL must start with http:// or https://",
});

// Deep Rich Content policy is enforced by the API; the form passes it through.
const richContent = z.custom<RichContent | null>(() => true);

// URLs are forgiven on input (scheme auto-prefixed in createProfileUpdate) and
// strictly re-validated by the server action via profileUpdateSchema.
const socialUrl = z.string().trim().min(1, "URL is required");

export const profileFormSchema = z.object({
  bio: richContent,
  image: z.string().nullable(),
  bannerImage: z.string().nullable(),
  socialLinks: z.array(
    z.object({
      platform: z.string().trim().min(1, "Platform is required"),
      url: socialUrl,
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

export function createProfileUpdate(
  values: ProfileFormValues,
  original: ProfileFormValues,
): ProfileUpdate {
  const entries: [string, string][] = values.socialLinks.map(({ platform, url }) => {
    const key = platform.trim().toLowerCase();
    const value = url.trim();
    const preset = getSocialPreset(key);
    // Presets accept a bare handle; anything with a path is taken as-is with
    // the scheme auto-prefixed, then re-validated by the server action.
    // (Handles may contain dots — e.g. instagram — but never slashes, so the
    // slash check keeps dotted handles from being treated as domains.)
    const fullUrl = /^https?:\/\//i.test(value)
      ? value
      : preset?.prefix && !value.includes("/")
        ? preset.prefix + value.replace(/^@/, "")
        : `https://${value}`;
    return [key, fullUrl];
  });
  const socialLinks = Object.fromEntries(entries.filter(([platform, url]) => platform && url));

  return {
    bio: values.bio && !isEmptyRichContent(values.bio) ? values.bio : null,
    // Unchanged images are omitted so the API doesn't re-verify legacy URLs it
    // didn't mint (foreign banner URLs from the old URL field would 422).
    image: values.image === original.image ? undefined : values.image,
    bannerImage: values.bannerImage === original.bannerImage ? undefined : values.bannerImage,
    socialLinks: Object.keys(socialLinks).length ? socialLinks : null,
  };
}

/** Strips a preset's prefix so the form field shows just the handle. URLs
 * with extra path (e.g. https://github.com/owner/repo) are kept whole — only
 * handle-shaped remainders (no slash) reduce, so saving round-trips exactly. */
function toFormUrl(platform: string, url: string): string {
  const prefix = getSocialPreset(platform)?.prefix;
  if (prefix && url.toLowerCase().startsWith(prefix)) {
    const handle = url.slice(prefix.length);
    if (handle && !handle.includes("/")) {
      return handle;
    }
  }
  return url;
}

export function createProfileFormValues(
  profile: UserOverview["profile"],
  avatarImage?: string | null,
): ProfileFormValues {
  return {
    bio: profile?.bio ?? null,
    image: avatarImage ?? profile?.image ?? null,
    bannerImage: profile?.bannerImage ?? null,
    socialLinks: Object.entries(profile?.socialLinks ?? {}).map(([platform, url]) => ({
      platform,
      url: toFormUrl(platform, url),
    })),
  };
}
