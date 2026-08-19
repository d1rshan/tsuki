import "server-only";

import { cacheLife } from "next/cache";

import type { MediaType } from "@tsuki/api/types";

import { publicApi } from "@/shared/lib/public-api";

export async function getDiscoverTrending() {
  "use cache: remote";
  cacheLife("days");

  const [anime, manga] = await Promise.all([getTrending("ANIME"), getTrending("MANGA")]);
  return { ANIME: anime, MANGA: manga };
}

async function getTrending(mediaType: MediaType) {
  const { data, error } = await publicApi.media({ type: mediaType }).trending.get();

  if (error) {
    throw new Error(`Failed to load trending ${mediaType.toLowerCase()}`, { cause: error });
  }

  return data;
}
