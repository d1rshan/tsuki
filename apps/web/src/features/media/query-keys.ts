import type { MediaType } from "@tsuki/api/types";

/** Client-side react-query keys for this module. */
export const mediaKeys = {
  /** The current user's entry and review for one title. */
  activity: (mediaType: MediaType, mediaId: number) =>
    ["media", "activity", mediaType, mediaId] as const,
  search: (mediaType: MediaType, query: string, includeNsfw: boolean) =>
    ["media", "search", mediaType, query, includeNsfw] as const,
};
