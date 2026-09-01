import { describe, expect, test } from "vitest";

import type { UserOverview } from "@tsuki/api/types";

import { createProfileFormValues, createProfileUpdate } from "@/features/profile/schemas";

type Profile = UserOverview["profile"];

function profileWith(socialLinks: Record<string, string> | null): Profile {
  return { socialLinks } as Profile;
}

function roundTrip(links: Record<string, string> | null): Record<string, string> | null {
  const original = createProfileFormValues(profileWith(links));
  const update = createProfileUpdate(original, original);
  return update.socialLinks ?? null;
}

describe("social link handle/URL round-trip", () => {
  test("preset handles with dots survive save (instagram)", () => {
    const links = roundTrip({ instagram: "https://instagram.com/foo.bar" });
    expect(links).toEqual({ instagram: "https://instagram.com/foo.bar" });
  });

  test("typed bare handle builds the full URL", () => {
    const form = createProfileFormValues(profileWith(null));
    form.socialLinks = [{ platform: "x", url: "darsh" }];
    const update = createProfileUpdate(form, form);
    expect(update.socialLinks).toEqual({ x: "https://x.com/darsh" });
  });

  test("strips leading @ and keeps youtube handle format", () => {
    const form = createProfileFormValues(profileWith(null));
    form.socialLinks = [{ platform: "youtube", url: "@darsh" }];
    const update = createProfileUpdate(form, form);
    expect(update.socialLinks).toEqual({ youtube: "https://youtube.com/@darsh" });
  });

  test("domain with path is scheme-prefixed, not prefixed into the template", () => {
    const form = createProfileFormValues(profileWith(null));
    form.socialLinks = [{ platform: "x", url: "x.com/darsh" }];
    const update = createProfileUpdate(form, form);
    expect(update.socialLinks).toEqual({ x: "https://x.com/darsh" });
  });

  test("website links without a scheme get https://", () => {
    const form = createProfileFormValues(profileWith(null));
    form.socialLinks = [{ platform: "website", url: "d1rshan.me" }];
    const update = createProfileUpdate(form, form);
    expect(update.socialLinks).toEqual({ website: "https://d1rshan.me" });
  });

  test("existing full URLs are preserved", () => {
    const links = roundTrip({
      github: "https://github.com/darsh",
      website: "https://d1rshan.me",
    });
    expect(links).toEqual({ github: "https://github.com/darsh", website: "https://d1rshan.me" });
  });
});
