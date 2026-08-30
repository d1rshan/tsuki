import { describe, expect, test } from "vitest";

import { buildSitemapEntries } from "@/shared/lib/sitemap";

describe("sitemap assembly", () => {
  test("builds home, media, and profile URLs with canonical casing", () => {
    const entries = buildSitemapEntries(
      "https://tsuki.fun",
      [
        { id: 21, type: "ANIME", updatedAt: new Date("2026-01-02T00:00:00Z") },
        { id: 5, type: "MANGA", updatedAt: new Date("2026-01-01T00:00:00Z") },
      ],
      [{ username: "mugi_tea" }],
    );

    expect(entries).toEqual([
      { url: "https://tsuki.fun", changeFrequency: "daily", priority: 1 },
      {
        url: "https://tsuki.fun/anime/21",
        lastModified: new Date("2026-01-02T00:00:00Z"),
        changeFrequency: "weekly",
        priority: 0.7,
      },
      {
        url: "https://tsuki.fun/manga/5",
        lastModified: new Date("2026-01-01T00:00:00Z"),
        changeFrequency: "weekly",
        priority: 0.7,
      },
      { url: "https://tsuki.fun/mugi_tea", changeFrequency: "daily", priority: 0.6 },
    ]);
  });
});
