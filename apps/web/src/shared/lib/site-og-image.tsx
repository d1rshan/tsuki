import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { ImageResponse } from "next/og";

import { getMediaOgFonts } from "@/features/media/og-fonts";
import { SiteOgCard } from "@/shared/components/site-og-card";

const covers = [
  "anime-3",
  "anime-8",
  "anime-8699",
  "anime-21",
  "anime-1376",
  "anime-1",
  "anime-7442",
  "anime-5646",
  "anime-42765",
  "anime-5",
  "anime-4",
];

export async function renderSiteOgImage() {
  const [artwork, fonts, moonFont] = await Promise.all([
    Promise.all(
      covers.map(async (cover) => {
        const data = await readFile(
          join(process.cwd(), "src/shared/assets/site-covers", `${cover}.jpg`),
        );
        return `data:image/jpeg;base64,${data.toString("base64")}`;
      }),
    ),
    getMediaOgFonts(),
    readFile(join(process.cwd(), "src/shared/assets/noto-moon-bold.ttf")),
  ]);
  return new ImageResponse(<SiteOgCard artwork={artwork} />, {
    width: 1200,
    height: 630,
    fonts: [...fonts, { name: "Noto Sans JP", data: moonFont, weight: 700, style: "normal" }],
  });
}
