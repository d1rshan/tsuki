import { useQuery, keepPreviousData } from "@tanstack/react-query";

import { anilistSearchMedia } from "@tsuki/anilist";
import type { MediaCompact, MediaType } from "@tsuki/api/types";

import { useDebounce } from "@/hooks/use-debounce";

import { mediaKeys } from "../query-keys";

// Search goes to AniList straight from the browser, deliberately: it keeps the
// full catalogue reachable without proxying every keystroke through our API.
// Our own media table only holds titles someone has already opened, so
// searching it would return a strict subset — there is no server-side search
// endpoint for that reason.

type AnilistResult = Awaited<ReturnType<typeof anilistSearchMedia>>[number];

/**
 * Bypassing our API means bypassing its response shape too, so results have to
 * be reshaped by hand into what the rest of the UI consumes.
 */
function toMediaCompact(row: AnilistResult, mediaType: MediaType): MediaCompact {
  return {
    id: row.id,
    type: mediaType,
    titleRomaji: row.titleRomaji,
    titleEnglish: row.titleEnglish,
    titleNative: row.titleNative,
    coverImageExtraLarge: row.coverImageExtraLarge,
    coverImageLarge: row.coverImageLarge,
    coverImageColor: row.coverImageColor,
    bannerImage: row.bannerImage,
    format: row.format,
    unitCount: mediaType === "anime" ? row.episodes : row.chapters,
    seasonYear: row.seasonYear,
    averageScore: row.averageScore,
  };
}

export function useMediaSearch(mediaType: MediaType, query: string, includeNsfw: boolean = false) {
  const debouncedQuery = useDebounce(query, 250);

  const queryResult = useQuery({
    queryKey: mediaKeys.search(mediaType, debouncedQuery, includeNsfw),
    queryFn: async () => {
      if (debouncedQuery.length === 0) return [];

      const results = await anilistSearchMedia(
        mediaType === "anime" ? "ANIME" : "MANGA",
        debouncedQuery,
        includeNsfw,
      );

      // Deduplicate by AniList id.
      const merged = new Map<number, MediaCompact>();
      results.forEach((row) => merged.set(row.id, toMediaCompact(row, mediaType)));

      return Array.from(merged.values());
    },
    enabled: debouncedQuery.length > 0,
    placeholderData: keepPreviousData,
  });

  return {
    ...queryResult,
    isDebouncing: query !== debouncedQuery,
  };
}
