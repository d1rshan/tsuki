import { describe, expect, test } from "bun:test";

import { createProfileUpdate, profileFormSchema } from "./schemas";

describe("profile input", () => {
  test("normalizes empty values and social platform names", () => {
    const values = profileFormSchema.parse({
      accentColor: "",
      bannerImage: "",
      bio: "  ",
      socialLinks: [{ platform: " AniList ", url: "https://anilist.co/user/tsuki" }],
    });

    expect(createProfileUpdate(values)).toEqual({
      accentColor: null,
      bannerImage: null,
      bio: null,
      socialLinks: { anilist: "https://anilist.co/user/tsuki" },
    });
  });

  test("rejects non-http profile links", () => {
    const result = profileFormSchema.safeParse({
      accentColor: "#112233",
      bannerImage: "javascript:alert(1)",
      bio: "Hello",
      socialLinks: [],
    });

    expect(result.success).toBeFalse();
  });
});
