import "server-only";

import type { Metadata } from "next";
import { cacheLife, cacheTag } from "next/cache";

import type { MediaType } from "@tsuki/api/types";

import { publicApi } from "@/shared/lib/public-api";

import { normalizeMedia, parseMediaId } from "./media";

/**
 * Tagged so a re-sync from AniList can bust a single title. The API serves this
 * from its own cache and only reaches AniList on a miss, so `max` here is safe.
 * Null for a title AniList has never heard of — an answer, not a failure.
 *
 * Throws on anything else, which errors the cache stream so the failure is not
 * stored, and the nearest error.tsx renders.
 */
export async function getMedia(mediaType: MediaType, id: number) {
  "use cache: remote";
  cacheTag(`media-${mediaType}-${id}`, "media");
  cacheLife("max");

  const { data, error } = await publicApi.media({ type: mediaType })({ id }).get();

  if (error) {
    if (error.status === 404) return null;
    throw new Error(`Failed to load ${mediaType.toLowerCase()} ${id}`, { cause: error });
  }

  return data;
}

export async function getMediaMetadata(mediaType: MediaType, id: string): Promise<Metadata> {
  const mediaId = parseMediaId(id);
  if (!mediaId) return { title: "Media not found" };

  const media = await getMedia(mediaType, mediaId);
  if (!media) return { title: "Media not found" };

  const { bannerImage: image, title, descriptionText } = normalizeMedia(media);

  return {
    title,
    description: descriptionText.slice(0, 160),
    openGraph: image ? { images: [image] } : undefined,
  };
}
