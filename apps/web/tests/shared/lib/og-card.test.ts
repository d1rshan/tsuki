import { describe, expect, test } from "vitest";

import { buildMediaOgCard, buildProfileOgCard } from "@/shared/lib/og-card";

describe("og card layout", () => {
  test("media with banner art uses the full-bleed banner layout", () => {
    const layout = buildMediaOgCard({
      title: "Frieren",
      type: "ANIME",
      bannerImage: "https://media.kitsu.io/banner.jpg",
      coverImage: "https://media.kitsu.io/cover.jpg",
    });

    expect(layout).toEqual({
      variant: "banner",
      kicker: "Anime",
      title: "Frieren",
      titleNative: null,
      bannerUrl: "https://media.kitsu.io/banner.jpg",
      coverUrl: "https://media.kitsu.io/cover.jpg",
    });
  });

  test("media without banner art falls back to the blurred-cover layout", () => {
    const layout = buildMediaOgCard({
      title: "Frieren",
      type: "MANGA",
      bannerImage: null,
      coverImage: "https://media.kitsu.io/cover.jpg",
    });

    expect(layout).toEqual({
      variant: "fallback",
      kicker: "Manga",
      title: "Frieren",
      titleNative: null,
      coverUrl: "https://media.kitsu.io/cover.jpg",
    });
  });

  test("media keeps a distinct native title and recognizes cover-only banners", () => {
    const layout = buildMediaOgCard({
      title: "Frieren",
      titleNative: "葬送のフリーレン",
      type: "ANIME",
      bannerImage: "cover.jpg",
      coverImage: "cover.jpg",
      hasBannerImage: false,
    });

    expect(layout).toMatchObject({
      variant: "fallback",
      titleNative: "葬送のフリーレン",
    });
  });

  test("profiles render their identity layout", () => {
    const layout = buildProfileOgCard({
      displayUsername: "Mugi",
      bio: "Tea enjoyer.",
    });

    expect(layout).toEqual({
      variant: "profile",
      title: "Mugi",
      description: "Tea enjoyer.",
      avatarUrl: null,
      bannerUrl: null,
    });
  });
});
