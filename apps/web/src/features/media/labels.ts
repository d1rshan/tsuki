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

/**
 * The phrase an Activity Log card shows between the actor and the title,
 * tracking-site style: "watched 12 episodes of …", "added … to their watch
 * list". `tail` renders after the title; `progressInLead` says the progress
 * count is already part of the phrase.
 */
export function logPhrase(
  mediaType: MediaType,
  status: ListStatus | null | undefined,
  progress?: number,
): { lead: string; tail?: string; progressInLead: boolean } {
  const read = mediaType === "MANGA";
  const verb = read ? "read" : "watched";
  const counted = progress ? `${progress} ${read ? "chapters" : "episodes"} of` : "";

  switch (status) {
    case "PLANNING":
      return {
        lead: "added",
        tail: read ? "to their read list" : "to their watch list",
        progressInLead: false,
      };
    case "COMPLETED":
      return { lead: "completed", progressInLead: false };
    case "DROPPED":
      return { lead: "dropped", progressInLead: false };
    case "PAUSED":
      return { lead: "paused", progressInLead: false };
    case "REPEATING":
      return {
        lead: progress
          ? `${read ? "reread" : "rewatched"} ${counted}`
          : read
            ? "reread"
            : "rewatched",
        progressInLead: Boolean(progress),
      };
    case "CURRENT":
      return {
        lead: progress ? `${verb} ${counted}` : verb,
        progressInLead: Boolean(progress),
      };
    default:
      return { lead: "updated", progressInLead: false };
  }
}

export function mediaHref(mediaType: MediaType, id: number) {
  return `/${mediaType.toLowerCase()}/${id}`;
}

export function mediaImageClass(mediaType: MediaType) {
  return mediaType === "MANGA" ? "grayscale opacity-90" : undefined;
}
