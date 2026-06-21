import { t } from "elysia";

export const AnimeModel = t.Object({
  id: t.Number({ description: "AniList ID of the anime" }),
  titleRomaji: t.Nullable(t.String()),
  titleEnglish: t.Nullable(t.String()),
  titleNative: t.Nullable(t.String()),
  description: t.Nullable(t.String()),
  coverImageExtraLarge: t.Nullable(t.String()),
  coverImageLarge: t.Nullable(t.String()),
  coverImageColor: t.Nullable(t.String()),
  bannerImage: t.Nullable(t.String()),
  format: t.Nullable(t.String()),
  status: t.Nullable(t.String()),
  episodes: t.Nullable(t.Number()),
  duration: t.Nullable(t.Number()),
  season: t.Nullable(t.String()),
  seasonYear: t.Nullable(t.Number()),
  averageScore: t.Nullable(t.Number()),
  meanScore: t.Nullable(t.Number()),
  popularity: t.Nullable(t.Number()),
  trending: t.Nullable(t.Number()),
  genres: t.Nullable(t.Array(t.String())),
  tags: t.Nullable(
    t.Array(
      t.Object({
        name: t.String(),
        rank: t.Nullable(t.Number()),
      }),
    ),
  ),
  isAdult: t.Nullable(t.Boolean()),
  createdAt: t.Date(),
  updatedAt: t.Date(),
});

export const AnimeCompactModel = t.Omit(AnimeModel, [
  "description",
  "coverImageColor",
  "format",
  "status",
  "duration",
  "season",
  "meanScore",
  "popularity",
  "trending",
  "genres",
  "tags",
  "isAdult",
  "createdAt",
  "updatedAt",
]);

export type Anime = typeof AnimeModel.static;
export type AnimeCompact = typeof AnimeCompactModel.static;
