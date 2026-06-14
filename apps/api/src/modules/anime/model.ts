import { t } from "elysia";

export const AnimeModel = t.Object({
  id: t.Number({ description: "AniList ID of the anime" }),
  titleRomaji: t.Union([t.String(), t.Null()]),
  titleEnglish: t.Union([t.String(), t.Null()]),
  titleNative: t.Union([t.String(), t.Null()]),
  description: t.Union([t.String(), t.Null()]),
  coverImageExtraLarge: t.Union([t.String(), t.Null()]),
  coverImageLarge: t.Union([t.String(), t.Null()]),
  coverImageColor: t.Union([t.String(), t.Null()]),
  bannerImage: t.Union([t.String(), t.Null()]),
  format: t.Union([t.String(), t.Null()]),
  status: t.Union([t.String(), t.Null()]),
  episodes: t.Union([t.Number(), t.Null()]),
  duration: t.Union([t.Number(), t.Null()]),
  season: t.Union([t.String(), t.Null()]),
  seasonYear: t.Union([t.Number(), t.Null()]),
  averageScore: t.Union([t.Number(), t.Null()]),
  meanScore: t.Union([t.Number(), t.Null()]),
  popularity: t.Union([t.Number(), t.Null()]),
  trending: t.Union([t.Number(), t.Null()]),
  genres: t.Union([t.Array(t.String()), t.Null()]),
  tags: t.Union([t.Any(), t.Null()]), // Alternatively: t.Array(t.Object({ name: t.String(), rank: t.Number() }))
  isAdult: t.Union([t.Boolean(), t.Null()]),
  createdAt: t.Date(),
  updatedAt: t.Date(),
});

export const TrendingAnimeResponseModel = t.Array(AnimeModel);

export type AnimeDto = typeof AnimeModel.static;
