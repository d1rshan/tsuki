import { ImageResponse } from "next/og";

import { OgCard } from "@/shared/components/og-card";
import { buildMediaOgCard, buildMinimalOgCard } from "@/shared/lib/og-card";

import { getMedia } from "./data";
import { normalizeMedia, parseMediaId } from "./media";

export const ogImageSize = { width: 1200, height: 630 };

/** Shared body for the per-route opengraph-image files, which Next requires one-per-route. */
export async function renderMediaOgImage(mediaType: "ANIME" | "MANGA", id: string) {
  const mediaId = parseMediaId(id);
  const media = mediaId ? await getMedia(mediaType, mediaId) : null;

  const layout = media
    ? buildMediaOgCard(normalizeMedia(media))
    : buildMinimalOgCard("Tsuki", "Track anime & manga.");

  return new ImageResponse(<OgCard layout={layout} />, ogImageSize);
}
