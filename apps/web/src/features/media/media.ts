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
export const MAX_MEDIA_ID = 2_147_483_647;

const MONTH_FORMATTER = new Intl.DateTimeFormat("en", { month: "long", timeZone: "UTC" });
const REGION_NAMES = new Intl.DisplayNames(["en"], { type: "region" });

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

export function mediaImageClass(mediaType: MediaType) {
  return mediaType === "MANGA" ? "grayscale opacity-90" : undefined;
}

type ExternalLink = {
  url: string;
  site: string;
  language?: string | null;
};

export function formatExternalLinks<T extends ExternalLink>(links: T[]): (T & { label: string })[] {
  const uniqueLinks = links.filter(
    (link, index) => links.findIndex(({ url }) => url === link.url) === index,
  );
  const siteCounts = new Map<string, number>();
  for (const { site } of uniqueLinks) {
    siteCounts.set(site, (siteCounts.get(site) ?? 0) + 1);
  }

  return uniqueLinks.map((link) => ({
    ...link,
    label:
      siteCounts.get(link.site)! > 1 && link.language
        ? `${link.site} (${link.language})`
        : link.site,
  }));
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

export function parseMediaId(value: string) {
  if (!/^[1-9]\d*$/.test(value)) return null;

  const id = Number(value);
  return Number.isSafeInteger(id) && id <= MAX_MEDIA_ID ? id : null;
}

export function formatMediaStatus(value: string) {
  return value.toLowerCase().replaceAll("_", " ");
}

export function formatMediaSource(value: string) {
  const label = formatMediaStatus(value);
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function formatCountry(code: string | null) {
  if (!code) return null;

  const normalizedCode = code.toUpperCase();
  try {
    const name = REGION_NAMES.of(normalizedCode);
    return name === normalizedCode ? null : name;
  } catch {
    return null;
  }
}

export function formatFuzzyDate(
  date: { year: number | null; month: number | null; day: number | null } | null,
) {
  if (!date) return null;

  const year = date.year?.toString();
  const month = date.month
    ? MONTH_FORMATTER.format(new Date(Date.UTC(2000, date.month - 1)))
    : null;
  const day = date.day;

  if (month && day && year) return `${month} ${day}, ${year}`;
  if (month && day) return `${month} ${day}`;
  if (month && year) return `${month} ${year}`;
  if (month) return month;
  if (day && year) return `Day ${day}, ${year}`;
  if (day) return `Day ${day}`;
  return year ?? null;
}

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  apos: "'",
  gt: ">",
  lt: "<",
  quot: '"',
};

function decodeEntity(entity: string) {
  let codePoint: number | undefined;

  if (entity.startsWith("#x")) {
    codePoint = Number.parseInt(entity.slice(2), 16);
  }

  if (entity.startsWith("#") && codePoint === undefined) {
    codePoint = Number.parseInt(entity.slice(1), 10);
  }

  if (codePoint !== undefined) {
    return codePoint >= 0 && codePoint <= 0x10ffff
      ? String.fromCodePoint(codePoint)
      : `&${entity};`;
  }

  return NAMED_ENTITIES[entity] ?? `&${entity};`;
}

export function mediaDescriptionText(description: string | null) {
  if (!description) return "No synopsis available.";

  return description
    .replace(/<br\s*\/?\s*>/gi, "\n")
    .replace(/<\/p\s*>/gi, "\n\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&(#x?[\da-f]+|[a-z]+);/gi, (_, entity: string) => decodeEntity(entity.toLowerCase()))
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
