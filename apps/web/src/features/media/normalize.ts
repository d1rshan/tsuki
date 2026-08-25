import type { Media, MediaCompact } from "@tsuki/api/types";

const MONTH_FORMATTER = new Intl.DateTimeFormat("en", { month: "long", timeZone: "UTC" });
const REGION_NAMES = new Intl.DisplayNames(["en"], { type: "region" });

export type NormalizedMediaCompact = MediaCompact & {
  title: string;
  coverImage: string | null;
  bannerImage: string | null;
  hasBannerImage: boolean;
  count: number | null;
};

export type NormalizedMedia = Media &
  NormalizedMediaCompact & {
    descriptionText: string;
    statusLabel: string | null;
    seasonLabel: string | null;
    genres: string[];
    details: RequiredMediaDetailItem[];
    links: MediaLinks;
    trailerUrl: string | null;
  };

type ExternalLink = {
  url: string;
  site: string;
  language?: string | null;
};

type MediaLinks = {
  heading: string;
  items: (ExternalLink & { label: string })[];
};

function formatExternalLinks<T extends ExternalLink>(links: T[]): (T & { label: string })[] {
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

export function normalizeMediaCompact(media: MediaCompact): NormalizedMediaCompact {
  const title = media.titleEnglish || media.titleRomaji || media.titleNative || "Unknown Title";
  const coverImage = media.coverImageExtraLarge || media.coverImageLarge || null;

  return {
    ...media,
    title,
    coverImage,
    bannerImage: media.bannerImage || coverImage,
    hasBannerImage: Boolean(media.bannerImage),
    count: media.type === "ANIME" ? media.episodes : media.chapters,
  };
}

export const MAX_MEDIA_ID = 2_147_483_647;

export function parseMediaId(value: string) {
  if (!/^[1-9]\d*$/.test(value)) return null;

  const id = Number(value);
  return Number.isSafeInteger(id) && id <= MAX_MEDIA_ID ? id : null;
}

function formatMediaStatus(value: string) {
  return value.toLowerCase().replaceAll("_", " ");
}

function formatMediaSource(value: string) {
  const label = formatMediaStatus(value);
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function formatCountry(code: string | null) {
  if (!code) return null;

  const normalizedCode = code.toUpperCase();
  try {
    const name = REGION_NAMES.of(normalizedCode);
    return name === normalizedCode ? null : name;
  } catch {
    return null;
  }
}

function formatFuzzyDate(
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

function mediaDescriptionText(description: string | null) {
  if (!description) return "No synopsis available.";

  return description
    .replace(/<br\s*\/?\s*>/gi, "\n")
    .replace(/<\/p\s*>/gi, "\n\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&(#x?[\da-f]+|[a-z]+);/gi, (_, entity: string) => decodeEntity(entity.toLowerCase()))
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

type MediaDetailItem = {
  label: string;
  value: string | number | null | undefined;
};

type RequiredMediaDetailItem = {
  label: string;
  value: string | number;
};

function getMediaDetailItems(media: Media): MediaDetailItem[] {
  const typeSpecificItems =
    media.type === "ANIME"
      ? [
          { label: "Episodes", value: media.episodes },
          { label: "Duration", value: media.duration ? `${media.duration} mins` : null },
        ]
      : [
          { label: "Chapters", value: media.chapters },
          { label: "Volumes", value: media.volumes },
        ];

  return [
    ...typeSpecificItems,
    { label: "Start date", value: formatFuzzyDate(media.startDate) },
    { label: "End date", value: formatFuzzyDate(media.endDate) },
    { label: "Source", value: media.source ? formatMediaSource(media.source) : null },
    { label: "Country", value: formatCountry(media.countryOfOrigin) },
    { label: "AniList popularity", value: media.popularity?.toLocaleString("en-US") },
    { label: "AniList favourites", value: media.favourites?.toLocaleString("en-US") },
  ];
}

function getMediaLinks(media: Media): MediaLinks {
  return {
    heading: media.type === "ANIME" ? "Where to Watch" : "Where to Read",
    items: formatExternalLinks(
      media.type === "ANIME"
        ? (media.externalLinks?.filter((link) => link.type === "STREAMING") ?? [])
        : (media.externalLinks ?? []),
    ),
  };
}

export function normalizeMedia(media: Media): NormalizedMedia {
  const compact = normalizeMediaCompact(media);
  const details = getMediaDetailItems(media).filter(
    (item): item is RequiredMediaDetailItem => item.value != null && item.value !== "",
  );

  return {
    ...media,
    ...compact,
    descriptionText: mediaDescriptionText(media.description),
    statusLabel: media.status ? formatMediaStatus(media.status) : null,
    seasonLabel: media.season && media.seasonYear ? `${media.season} ${media.seasonYear}` : null,
    genres: media.genres ?? [],
    details,
    links: getMediaLinks(media),
    trailerUrl:
      media.trailer?.site === "youtube"
        ? `https://www.youtube.com/embed/${media.trailer.id}?rel=0`
        : null,
  };
}
