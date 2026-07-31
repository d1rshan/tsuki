import type { ListStatus, MediaType } from "@tsuki/api/types";

/**
 * Anime and manga are modelled identically by the API — one `mediaType`, one
 * `progress` count, one status vocabulary. Everything that differs between them
 * is presentational, and all of it lives here.
 */
export const MEDIA = {
  ANIME: {
    label: "Anime",
    /** Progress unit, in the three forms the UI needs. */
    unitLong: "Episodes",
    unitShort: "eps",
    unitAbbrev: "Ep",
    defaultStatus: "PLANNING",
    statuses: [
      { value: "CURRENT", label: "Watching" },
      { value: "COMPLETED", label: "Completed" },
      { value: "PLANNING", label: "Plan to Watch" },
      { value: "PAUSED", label: "Paused" },
      { value: "DROPPED", label: "Dropped" },
      { value: "REPEATING", label: "Rewatching" },
    ],
  },
  MANGA: {
    label: "Manga",
    unitLong: "Chapters",
    unitShort: "ch",
    unitAbbrev: "Ch",
    defaultStatus: "PLANNING",
    statuses: [
      { value: "CURRENT", label: "Reading" },
      { value: "COMPLETED", label: "Completed" },
      { value: "PLANNING", label: "Plan to Read" },
      { value: "PAUSED", label: "Paused" },
      { value: "DROPPED", label: "Dropped" },
      { value: "REPEATING", label: "Rereading" },
    ],
  },
} as const satisfies Record<
  MediaType,
  {
    label: string;
    unitLong: string;
    unitShort: string;
    unitAbbrev: string;
    defaultStatus: ListStatus;
    statuses: readonly { value: ListStatus; label: string }[];
  }
>;

export const MEDIA_TYPES = ["ANIME", "MANGA"] as const satisfies readonly MediaType[];

/**
 * The API stores one status vocabulary for both types, so CURRENT has to render
 * as "Watching" or "Reading" depending on what is being displayed.
 */
export function statusLabel(mediaType: MediaType, status: ListStatus): string {
  return MEDIA[mediaType].statuses.find((entry) => entry.value === status)?.label ?? status;
}

/** Episodes or chapters — whichever unit this media counts. */
export function unitCount(media: {
  type: MediaType;
  episodes: number | null;
  chapters: number | null;
}) {
  return media.type === "ANIME" ? media.episodes : media.chapters;
}

/** Route segments stay lowercase — `/anime/21`, not the `ANIME` the data carries. */
export function mediaHref(mediaType: MediaType, id: number) {
  return `/${mediaType.toLowerCase()}/${id}`;
}

export function getMediaTitle(media: {
  titleEnglish?: string | null;
  titleRomaji?: string | null;
  titleNative?: string | null;
}): string {
  return media.titleEnglish || media.titleRomaji || media.titleNative || "Unknown Title";
}

export function getMediaCoverImage(media: {
  coverImageExtraLarge?: string | null;
  coverImageLarge?: string | null;
}): string {
  return media.coverImageExtraLarge || media.coverImageLarge || "";
}

export function getMediaBannerImage(media: {
  bannerImage?: string | null;
  coverImageExtraLarge?: string | null;
  coverImageLarge?: string | null;
}): string {
  return media.bannerImage || getMediaCoverImage(media);
}
