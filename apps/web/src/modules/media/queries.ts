import { cacheLife, cacheTag } from "next/cache";

import type { MediaType } from "@tsuki/api/types";

import { api } from "@/lib/api";

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

  const { data, error } = await api.media({ type: mediaType })({ id }).get();

  if (error) {
    if (error.status === 404) return null;
    throw error;
  }

  return data;
}

/**
 * Returns the failure instead of throwing, unlike `getMedia`: `/` is prerendered
 * at build time, and a throw there fails the build whenever the API is not up.
 * The cost is that a failed fetch is cached for the lifetime above.
 */
export async function getTrending(mediaType: MediaType) {
  "use cache: remote";
  cacheTag(`trending-${mediaType}`, "trending");
  cacheLife("days");

  const { data, error } = await api.media({ type: mediaType }).trending.get();

  if (error) return { data: null, error } as const;
  return { data, error: null } as const;
}
