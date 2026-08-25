import {
  MEDIA_FORMATS,
  MEDIA_SEASONS,
  MEDIA_SOURCES,
  MEDIA_STATUSES,
  MEDIA_TYPES,
} from "@tsuki/anilist";
import { t } from "elysia";

/**
 * AniList's vocabulary, carried unchanged from the database through to the
 * client. Built from the canonical arrays in @tsuki/anilist rather than
 * restated here.
 */
export const MediaTypeEnum = t.UnionEnum(MEDIA_TYPES);
export type MediaType = typeof MediaTypeEnum.static;

export const FuzzyDateModel = t.Object({
  year: t.Nullable(t.Number()),
  month: t.Nullable(t.Number()),
  day: t.Nullable(t.Number()),
});

export const MediaFormatEnum = t.UnionEnum(MEDIA_FORMATS);

export const MediaStatusEnum = t.UnionEnum(MEDIA_STATUSES);

export const MediaSeasonEnum = t.UnionEnum(MEDIA_SEASONS);

export const MediaSourceEnum = t.UnionEnum(MEDIA_SOURCES);

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
    source: t.Nullable(MediaSourceEnum),
    countryOfOrigin: t.Nullable(t.String()),
    /** Anime only — minutes per episode. */
    duration: t.Nullable(t.Number()),
    /** Manga only. */
    volumes: t.Nullable(t.Number()),
    startDate: t.Nullable(FuzzyDateModel),
    endDate: t.Nullable(FuzzyDateModel),
    season: t.Nullable(MediaSeasonEnum),
    popularity: t.Nullable(t.Number()),
    favourites: t.Nullable(t.Number()),
    genres: t.Nullable(t.Array(t.String())),
    trailer: t.Nullable(t.Object({ id: t.String(), site: t.String(), thumbnail: t.String() })),
    externalLinks: t.Nullable(
      t.Array(
        t.Object({
          url: t.String(),
          site: t.String(),
          type: t.String(),
          language: t.Optional(t.Nullable(t.String())),
          color: t.Nullable(t.String()),
          icon: t.Nullable(t.String()),
        }),
      ),
    ),
  }),
]);

export type Media = typeof MediaModel.static;
export type MediaCompact = typeof MediaCompactModel.static;
