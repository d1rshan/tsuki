import { cacheLife, cacheTag } from "next/cache";

import type { MediaType } from "@tsuki/api/types";

import { api } from "@/lib/api";

/**
 * Tagged so a re-sync from AniList can bust a single title. The API serves this
 * from its own cache and only reaches AniList on a miss, so `max` here is safe.
 */
export async function getMedia(mediaType: MediaType, id: number) {
  "use cache: remote";
  cacheTag(`media-${mediaType}-${id}`, "media");
  cacheLife("max");

  const { data, error } = await api.media({ type: mediaType })({ id }).get();

  if (error) return { data: null, error } as const;
  return { data, error: null } as const;
}

export async function getTrending(mediaType: MediaType) {
  "use cache: remote";
  cacheTag(`trending-${mediaType}`, "trending");
  cacheLife("days");

  const { data, error } = await api.media({ type: mediaType }).trending.get();

  if (error) return { data: null, error } as const;
  return { data, error: null } as const;
}
