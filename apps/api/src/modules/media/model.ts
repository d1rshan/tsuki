import { MEDIA_FORMATS, MEDIA_STATUSES, MEDIA_TYPES } from "@tsuki/db";
import type { MediaRow } from "@tsuki/kitsu";
import { t } from "elysia";

/**
 * The media vocabulary, carried unchanged from the database through to the
 * client. Built from the canonical arrays in @tsuki/db rather than restated
 * here.
 */
/**
 * `default: undefined` overrides UnionEnum's implicit `default: values[0]`:
 * Elysia fills an omitted optional query `type` with "ANIME", silently
 * filtering library/review listings to anime only. See ListStatusEnum.
 */
export const MediaTypeEnum = t.UnionEnum(MEDIA_TYPES, { default: undefined });
export type MediaType = typeof MediaTypeEnum.static;

export const FuzzyDateModel = t.Object({
  year: t.Nullable(t.Number()),
  month: t.Nullable(t.Number()),
  day: t.Nullable(t.Number()),
});

export const MediaFormatEnum = t.UnionEnum(MEDIA_FORMATS);

export const MediaStatusEnum = t.UnionEnum(MEDIA_STATUSES);

/** The shape embedded in cards, grids, library entries and reviews. */
export const MediaCompactModel = t.Object({
  id: t.Number(),
  type: MediaTypeEnum,
  titleRomaji: t.Nullable(t.String()),
  titleEnglish: t.Nullable(t.String()),
  titleNative: t.Nullable(t.String()),
  coverImageExtraLarge: t.Nullable(t.String()),
  coverImageLarge: t.Nullable(t.String()),
  coverImageColor: t.Nullable(t.String()),
  bannerImage: t.Nullable(t.String()),
  /** URL path segment on kitsu.app. Optional: legacy cache rows predate it. */
  slug: t.Optional(t.Nullable(t.String())),
  /** Optional for the same reason; always present on Kitsu-sourced rows. */
  nsfw: t.Optional(t.Boolean()),
  format: t.Nullable(MediaFormatEnum),
  /** Anime only. */
  episodes: t.Nullable(t.Number()),
  /** Manga only. */
  chapters: t.Nullable(t.Number()),
  seasonYear: t.Nullable(t.Number()),
  averageScore: t.Nullable(t.Number()),
});

export const MediaModel = t.Composite([
  MediaCompactModel,
  t.Object({
    description: t.Nullable(t.String()),
    status: t.Nullable(MediaStatusEnum),
    /** Anime only — minutes per episode. */
    duration: t.Nullable(t.Number()),
    /** Manga only. */
    volumes: t.Nullable(t.Number()),
    startDate: t.Nullable(FuzzyDateModel),
    endDate: t.Nullable(FuzzyDateModel),
    popularity: t.Nullable(t.Number()),
    favourites: t.Nullable(t.Number()),
    genres: t.Nullable(t.Array(t.String())),
    trailer: t.Nullable(t.Object({ id: t.String(), site: t.String(), thumbnail: t.String() })),
    externalLinks: t.Nullable(t.Array(t.Object({ url: t.String(), site: t.String() }))),
  }),
]);

export type Media = typeof MediaModel.static;
export type MediaCompact = typeof MediaCompactModel.static;

// Fails to compile if the Kitsu mapper gains a field this client-facing
// model lacks — add it to MediaCompactModel/MediaModel when that happens.
type MissingModelFields = Exclude<keyof MediaRow, keyof Media>;
const _mediaRowFieldsCovered: [MissingModelFields] extends [never] ? true : false = true;
