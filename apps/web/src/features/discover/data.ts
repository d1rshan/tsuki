import "server-only";

import { cacheLife } from "next/cache";

import type { MediaType } from "@tsuki/api/types";

import { publicApi } from "@/shared/lib/public-api";

export async function getDiscoverMediaTrending() {
  "use cache: remote";

  try {
    const [anime, manga] = await Promise.all([getTrending("ANIME"), getTrending("MANGA")]);
    cacheLife("days");
    return { ANIME: anime, MANGA: manga };
  } catch {
    // ponytail: don't poison the cache on failure — retry on next request instead
    cacheLife({ stale: 0, revalidate: 30, expire: 60 });
    return null;
  }
}

async function getTrending(mediaType: MediaType) {
  const { data, error } = await publicApi.media({ type: mediaType }).trending.get();

  if (error) {
    throw new Error(`Failed to load trending ${mediaType.toLowerCase()}`, { cause: error });
  }

  return data;
}
