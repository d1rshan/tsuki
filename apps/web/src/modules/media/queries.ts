import { cacheLife, cacheTag } from "next/cache";

import type { MediaType } from "@tsuki/api/types";

import { api } from "@/lib/api";

// Returning a failure would cache it for the whole lifetime below, so a single
// bad minute at AniList would outlive itself by days. Throwing instead errors
// the cache stream, which the handler declines to store, and the nearest
// error.tsx boundary renders.

/**
 * Tagged so a re-sync from AniList can bust a single title. The API serves this
 * from its own cache and only reaches AniList on a miss, so `max` here is safe.
 * Null for a title AniList has never heard of — an answer, not a failure.
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

export async function getTrending(mediaType: MediaType) {
  "use cache: remote";
  cacheTag(`trending-${mediaType}`, "trending");
  cacheLife("days");

  const { data, error } = await api.media({ type: mediaType }).trending.get();

  if (error) throw error;

  return data;
}
