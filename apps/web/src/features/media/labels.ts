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

function ordinal(n: number) {
  const rem10 = n % 10;
  const rem100 = n % 100;
  if (rem10 === 1 && rem100 !== 11) return `${n}st`;
  if (rem10 === 2 && rem100 !== 12) return `${n}nd`;
  if (rem10 === 3 && rem100 !== 13) return `${n}rd`;
  return `${n}th`;
}

/**
 * Everything an Activity Log card says, in natural English: the lead between
 * actor (or nothing, verb-first) and title, the tail after it, and the details
 * row beneath — which only carries what the lead does not already state.
 * `"social"` mode reads "watched …"; `"profile"` mode is verb-first
 * ("Watched …") and drops the possessive, since the page IS the actor.
 */
export function logPhrase(
  mediaType: MediaType,
  snapshot: ActivityPhraseInput,
  mode: "social" | "profile" = "social",
): { lead: string; tail?: string; details: string } {
  const read = mediaType === "MANGA";
  const verb = read ? "read" : "watched";
  const reverb = read ? "reread" : "rewatched";
  const units = read ? "chapters" : "episodes";
  const { status, score, progress, progressFrom, progressVolumes, progressVolumesFrom, repeat } =
    snapshot;

  const dayVerb = status === "REPEATING" ? reverb : verb;
  const possessive = mode === "profile" ? "the" : "their";

  let lead: string;
  let tail: string | undefined;
  let volumesStated = false;
  let progressStated = false;

  if (progress != null && progressFrom != null && progress > progressFrom) {
    lead = `${dayVerb} ${units} ${progressFrom + 1}–${progress} of`;
    progressStated = true;
  } else if (
    progressVolumes != null &&
    progressVolumesFrom != null &&
    progressVolumes > progressVolumesFrom
  ) {
    // volumes are the axis the day moved; the chapter count is noise next to it
    lead = `${dayVerb} volumes ${progressVolumesFrom + 1}–${progressVolumes} of`;
    volumesStated = true;
    progressStated = true;
  } else if (progress && (status === "CURRENT" || status === "REPEATING")) {
    lead = `${dayVerb} ${progress} ${units} of`;
    progressStated = true;
  } else if (score && (status === "CURRENT" || status == null)) {
    lead = "rated";
  } else {
    switch (status) {
      case "PLANNING":
        lead = "added";
        tail = read ? `to ${possessive} read list` : `to ${possessive} watch list`;
        break;
      case "COMPLETED":
        lead = "completed";
        break;
      case "DROPPED":
        lead = "dropped";
        break;
      case "PAUSED":
        lead = "paused";
        break;
      case "CURRENT":
      case "REPEATING":
        lead = dayVerb;
        break;
      default:
        lead = "updated";
    }
  }

  if (!tail && repeat) tail = `for the ${ordinal(repeat)} time`;

  if (mode === "profile") {
    lead = lead.charAt(0).toUpperCase() + lead.slice(1);
  }

  const details = [
    progressStated || !progress ? null : String(progress),
    volumesStated || progressVolumes == null ? null : `${progressVolumes} volumes`,
    score ? `${score}/10` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return { lead, tail, details };
}

export function mediaHref(mediaType: MediaType, id: number) {
  return `/${mediaType.toLowerCase()}/${id}`;
}

export function mediaImageClass(mediaType: MediaType) {
  return mediaType === "MANGA" ? "grayscale opacity-90" : undefined;
}
