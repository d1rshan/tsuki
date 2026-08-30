import { describe, expect, test } from "vitest";

import { buildMediaOgCard, buildProfileOgCard } from "@/shared/lib/og-card";

describe("og card layout", () => {
  test("media with banner art uses the full-bleed banner layout", () => {
    const layout = buildMediaOgCard({
      title: "Frieren",
      type: "ANIME",
      bannerImage: "https://s4.anilist.co/banner.jpg",
      coverImage: "https://s4.anilist.co/cover.jpg",
    });

    expect(layout).toEqual({
      variant: "banner",
      kicker: "Anime",
      title: "Frieren",
      bannerUrl: "https://s4.anilist.co/banner.jpg",
      coverUrl: "https://s4.anilist.co/cover.jpg",
    });
  });

  test("media without banner art falls back to the blurred-cover layout", () => {
    const layout = buildMediaOgCard({
      title: "Frieren",
      type: "MANGA",
      bannerImage: null,
      coverImage: "https://s4.anilist.co/cover.jpg",
    });

    expect(layout).toEqual({
      variant: "fallback",
      kicker: "Manga",
      title: "Frieren",
      coverUrl: "https://s4.anilist.co/cover.jpg",
    });
  });

  test("profiles render the minimal cover-less layout", () => {
    const layout = buildProfileOgCard({
      displayUsername: "Mugi",
      bio: "Tea enjoyer.",
    });

    expect(layout).toEqual({
      variant: "minimal",
      title: "Mugi",
      description: "Tea enjoyer.",
    });
  });
});
