import type { MediaType } from "@tsuki/api/types";

export const mediaKeys = {
  activity: (mediaType: MediaType, mediaId: number) =>
    ["media", "activity", mediaType, mediaId] as const,
  search: (mediaType: MediaType, query: string, includeNsfw: boolean) =>
    ["media", "search", mediaType, query, includeNsfw] as const,
};
