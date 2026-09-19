import { KitsuError, kitsuFetchPage, kitsuRequest } from "../client";
import type {
  KitsuDocument,
  KitsuIncluded,
  KitsuMapping,
  KitsuMedia,
  KitsuPage,
  MediaType,
} from "../types";
import { toMediaCompactRow, toMediaRow, type MediaCompactRow, type MediaRow } from "./mappers";

export type { MediaRow, MediaCompactRow };
export { toMediaRow };

const PATHS: Record<MediaType, "anime" | "manga"> = { ANIME: "anime", MANGA: "manga" };

// Only anime carries streaming links; asking manga for them is a 400.
const INCLUDE: Record<MediaType, string> = {
  ANIME: "categories,streamingLinks",
  MANGA: "categories",
};

/**
 * Fetches one media by Kitsu id with its categories and streaming links
 * included. Null when no media of that type carries the id — Kitsu answers
 * those with a 404, which is raised rather than returned, so the catch is the
 * only place that sees them.
 */
export async function kitsuMediaById(type: MediaType, id: number) {
  try {
    const response = await kitsuRequest<KitsuDocument<KitsuMedia, KitsuIncluded>>(
      `/${PATHS[type]}/${id}`,
      { include: INCLUDE[type] },
    );

    return response.data ? toMediaRow(response.data, response.included) : null;
  } catch (error) {
    if (error instanceof KitsuError && error.status === 404) return null;
    throw error;
  }
}

/**
 * Searches Kitsu for media of the given type. Kitsu never returns NSFW media
 * to unauthenticated requests, so `includeNsfw` cannot actually reveal any —
 * it only omits the explicit `filter[nsfw]=false`, keeping the call symmetric
 * with the future authenticated one.
 */
export async function kitsuSearchMedia(
  type: MediaType,
  query: string,
  { includeNsfw = false } = {},
) {
  const response = await kitsuRequest<KitsuPage<KitsuMedia>>(`/${PATHS[type]}`, {
    "filter[text]": query,
    "filter[nsfw]": includeNsfw ? undefined : false,
  });

  return response.data.map(toMediaCompactRow);
}

/** One raw page of the anime or manga collection, for the sync engine. */
export function kitsuPage(type: MediaType, offset: number, limit = 20) {
  return kitsuFetchPage(PATHS[type], offset, limit);
}

/** One raw page of the mappings collection, for the AniList→Kitsu crosswalk. */
export async function kitsuMappingPage(site: string, offset: number, limit = 20) {
  return kitsuRequest<KitsuPage<KitsuMapping>>("/mappings", {
    "filter[externalSite]": site,
    "page[offset]": offset,
    "page[limit]": limit,
  });
}
