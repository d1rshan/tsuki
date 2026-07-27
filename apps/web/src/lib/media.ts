import type {
  AnimeCompact,
  LibraryEntry,
  MangaCompact,
  MangaLibraryEntry,
  MangaReview,
  ReadStatus,
  Review,
  WatchStatus,
} from "@/lib/types";

export type MediaType = "anime" | "manga";

export type MediaStatus = WatchStatus | ReadStatus;

/**
 * Anime and manga are modelled identically apart from their progress unit
 * (episodes vs chapters) and their status enum. Everything the UI needs to know
 * about that difference lives here.
 */
export const MEDIA = {
  anime: {
    label: "Anime",
    /** Progress unit, in the three forms the UI needs. */
    unitLong: "Episodes",
    unitShort: "eps",
    unitAbbrev: "Ep",
    defaultStatus: "PLAN_TO_WATCH",
    statuses: [
      { value: "WATCHING", label: "Watching" },
      { value: "COMPLETED", label: "Completed" },
      { value: "PLAN_TO_WATCH", label: "Plan to Watch" },
      { value: "PAUSED", label: "Paused" },
      { value: "DROPPED", label: "Dropped" },
    ],
  },
  manga: {
    label: "Manga",
    unitLong: "Chapters",
    unitShort: "ch",
    unitAbbrev: "Ch",
    defaultStatus: "PLAN_TO_READ",
    statuses: [
      { value: "READING", label: "Reading" },
      { value: "COMPLETED", label: "Completed" },
      { value: "PLAN_TO_READ", label: "Plan to Read" },
      { value: "PAUSED", label: "Paused" },
      { value: "DROPPED", label: "Dropped" },
    ],
  },
} as const satisfies Record<
  MediaType,
  {
    label: string;
    unitLong: string;
    unitShort: string;
    unitAbbrev: string;
    defaultStatus: MediaStatus;
    statuses: readonly { value: MediaStatus; label: string }[];
  }
>;

export function mediaHref(mediaType: MediaType, id: number) {
  return `/${mediaType}/${id}`;
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

/** Total episodes/chapters, whichever the media carries. */
export function getMediaUnitCount(media: AnimeCompact | MangaCompact): number | null {
  return "episodes" in media ? media.episodes : media.chapters;
}

/** The trimmed-down anime/manga shape embedded in library entries and reviews. */
export type LibraryMedia = NonNullable<LibraryEntry["anime"] | MangaLibraryEntry["manga"]>;

export type MediaEntry = {
  mediaType: MediaType;
  mediaId: number;
  media: LibraryMedia | undefined;
  status: MediaStatus | null;
  rating: number | null;
  /** Episodes watched or chapters read. */
  progress: number;
  isFavorite: boolean;
};

/** Collapses an anime or manga library entry into one shape the UI can render. */
export function toMediaEntry(entry: LibraryEntry | MangaLibraryEntry): MediaEntry {
  const common = {
    status: entry.status,
    rating: entry.rating,
    isFavorite: entry.isFavorite,
  };

  return "animeId" in entry
    ? {
        ...common,
        mediaType: "anime",
        mediaId: entry.animeId,
        media: entry.anime,
        progress: entry.episodesWatched,
      }
    : {
        ...common,
        mediaType: "manga",
        mediaId: entry.mangaId,
        media: entry.manga,
        progress: entry.chaptersRead,
      };
}

export type MediaReviewEntry = {
  id: string;
  mediaType: MediaType;
  mediaId: number;
  media: LibraryMedia | undefined;
  content: string;
  containsSpoilers: boolean;
  createdAt: Date;
  updatedAt: Date;
};

/** Collapses an anime or manga review into one shape the UI can render. */
export function toMediaReview(review: Review | MangaReview): MediaReviewEntry {
  const common = {
    id: review.id,
    content: review.content,
    containsSpoilers: review.containsSpoilers,
    createdAt: review.createdAt,
    updatedAt: review.updatedAt,
  };

  return "animeId" in review
    ? { ...common, mediaType: "anime", mediaId: review.animeId, media: review.anime }
    : { ...common, mediaType: "manga", mediaId: review.mangaId, media: review.manga };
}
