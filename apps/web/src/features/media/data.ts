import "server-only";

import { cacheLife, cacheTag } from "next/cache";

import type { MediaType } from "@tsuki/api/types";

import { publicApi } from "@/shared/lib/public-api";

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

// TODO: better to move to discover feature ig
export async function getTrending(mediaType: MediaType) {
  const { data, error } = await publicApi.media({ type: mediaType }).trending.get();
  if (error) {
    throw new Error(`Failed to load trending ${mediaType.toLowerCase()}`, { cause: error });
  }

  return data;
}
