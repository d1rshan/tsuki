import { t } from "elysia";

export const AnimeModel = t.Object({
  id: t.Number(),
  title: t.Object({
    romaji: t.String(),
    english: t.Union([t.String(), t.Null()]),
  }),
  coverImage: t.Object({
    large: t.String(),
  }),
});

export type Anime = typeof AnimeModel.static;
