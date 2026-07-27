import { t } from "elysia";

const MediaStatusEnum = t.Union([
  t.Literal("FINISHED"),
  t.Literal("RELEASING"),
  t.Literal("NOT_YET_RELEASED"),
  t.Literal("CANCELLED"),
  t.Literal("HIATUS"),
]);

export const MangaModel = t.Object({
  id: t.Number({ description: "AniList ID of the manga" }),
  titleRomaji: t.Nullable(t.String()),
  titleEnglish: t.Nullable(t.String()),
  titleNative: t.Nullable(t.String()),
  description: t.Nullable(t.String()),
  coverImageExtraLarge: t.Nullable(t.String()),
  coverImageLarge: t.Nullable(t.String()),
  coverImageColor: t.Nullable(t.String()),
  bannerImage: t.Nullable(t.String()),
  format: t.Nullable(t.String()),
  status: t.Nullable(MediaStatusEnum),
  chapters: t.Nullable(t.Number()),
  volumes: t.Nullable(t.Number()),
  season: t.Nullable(t.String()),
  seasonYear: t.Nullable(t.Number()),
  averageScore: t.Nullable(t.Number()),
  meanScore: t.Nullable(t.Number()),
  popularity: t.Nullable(t.Number()),
  trending: t.Nullable(t.Number()),
  genres: t.Nullable(t.Array(t.String())),
  trailer: t.Nullable(
    t.Object({
      id: t.String(),
      site: t.String(),
      thumbnail: t.String(),
    }),
  ),
  externalLinks: t.Nullable(
    t.Array(
      t.Object({
        url: t.String(),
        site: t.String(),
        type: t.String(),
        color: t.Nullable(t.String()),
        icon: t.Nullable(t.String()),
      }),
    ),
  ),
  isAdult: t.Nullable(t.Boolean()),
  createdAt: t.Date(),
  updatedAt: t.Date(),
});

export const MangaCompactModel = t.Omit(MangaModel, [
  "description",
  "coverImageColor",
  "format",
  "status",
  "volumes",
  "season",
  "meanScore",
  "popularity",
  "trending",
  "genres",
  "trailer",
  "externalLinks",
  "isAdult",
  "createdAt",
  "updatedAt",
]);

export type Manga = typeof MangaModel.static;
export type MangaCompact = typeof MangaCompactModel.static;
