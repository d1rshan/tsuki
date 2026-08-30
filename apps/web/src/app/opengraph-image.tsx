import { ImageResponse } from "next/og";

import { OgCard } from "@/shared/components/og-card";
import { buildMinimalOgCard } from "@/shared/lib/og-card";
import { siteDescription, siteTagline } from "@/shared/lib/site";

export const alt = siteTagline;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(<OgCard layout={buildMinimalOgCard("Tsuki", siteDescription)} />, size);
}
