import { createElement } from "react";
import { ImageResponse } from "next/og";
import { describe, expect, test } from "vitest";

import { getMediaOgFonts } from "@/features/media/og-fonts";
import { OgCard } from "@/shared/components/og-card";
import { buildMediaOgCard } from "@/shared/lib/og-card";

const pixel =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/aN8AAAAASUVORK5CYII=";

describe("media OG image rendering", () => {
  test.each(["ANIME", "MANGA"] as const)("renders %s with and without a banner", async (type) => {
    for (const hasBannerImage of [true, false]) {
      const layout = buildMediaOgCard({
        title: "Example",
        type,
        bannerImage: pixel,
        coverImage: pixel,
        hasBannerImage,
      });
      const image = new ImageResponse(createElement(OgCard, { layout }), {
        width: 1200,
        height: 630,
      });
      expect((await image.arrayBuffer()).byteLength).toBeGreaterThan(0);
    }
  });

  test("renders a Japanese native title using the production fonts", async () => {
    const fonts = await getMediaOgFonts();
    const media = {
      title: "Frieren",
      type: "ANIME" as const,
      bannerImage: pixel,
      coverImage: pixel,
    };

    async function render(titleNative: string | null) {
      const layout = buildMediaOgCard({ ...media, titleNative });
      const image = new ImageResponse(createElement(OgCard, { layout }), {
        width: 1200,
        height: 630,
        fonts,
      });
      return Buffer.from(await image.arrayBuffer());
    }

    const withNativeTitle = await render("葬送のフリーレン");
    const withoutNativeTitle = await render(null);
    expect(withNativeTitle.length).toBeGreaterThan(0);
    expect(withNativeTitle.equals(withoutNativeTitle)).toBe(false);
  });
});
