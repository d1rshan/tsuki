import type { Activity, ListStatus, MediaType } from "@tsuki/api/types";

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

/** The Log fields a phrase can speak about — the wire snapshot itself. */
export type ActivityPhraseInput = Activity["snapshot"];

/** Shared sentence fragments for Public, Following, and Profile Activity. */
export function logPhrase(
  mediaType: MediaType,
  snapshot: ActivityPhraseInput,
): { lead: string; tail?: string } | null {
  const { status, statusFrom, statusChanged, progress, progressFrom } = snapshot;
  const increased =
    progress != null &&
    progress > 0 &&
    (progressFrom === null || (progressFrom !== undefined && progress > progressFrom));
  const changedStatus =
    status != null && statusFrom !== undefined && (statusChanged === true || status !== statusFrom);
  if (!increased && !changedStatus) return null;

  const statusText = status ? statusLabel(mediaType, status) : "";
  if (!increased) return { lead: `Changed status to ${statusText} for` };

  const verb = mediaType === "MANGA" ? "Read" : "Watched";
  const units = mediaType === "MANGA" ? "chapters" : "episodes";
  const count =
    progressFrom == null ? `${progress} ${units}` : `${units} ${progressFrom + 1}–${progress}`;
  return {
    lead: `${verb} ${count} of`,
    ...(changedStatus ? { tail: `· changed status to ${statusText}` } : {}),
  };
}

export function reviewFragment(mediaType: MediaType, mediaId: number) {
  return `review-${mediaType.toLowerCase()}-${mediaId}`;
}

export function reviewHref(username: string, mediaType: MediaType, mediaId: number) {
  return `/${username}/reviews?type=${mediaType}#${reviewFragment(mediaType, mediaId)}`;
}

export function mediaHref(mediaType: MediaType, id: number) {
  return `/${mediaType.toLowerCase()}/${id}`;
}

export function mediaImageClass(mediaType: MediaType) {
  return mediaType === "MANGA" ? "grayscale opacity-90" : undefined;
}
