import { t } from "elysia";

import { FuzzyDateModel, MediaCompactModel, MediaTypeParam } from "../media/model";

/** AniList's MediaListStatus — type-agnostic, so anime and manga share it. */
export const ListStatusEnum = t.Union([
  t.Literal("CURRENT"),
  t.Literal("PLANNING"),
  t.Literal("COMPLETED"),
  t.Literal("DROPPED"),
  t.Literal("PAUSED"),
  t.Literal("REPEATING"),
]);

export const LibraryEntryModel = t.Object({
  mediaType: MediaTypeParam,
  mediaId: t.Number(),
  media: t.Nullable(MediaCompactModel),
  status: t.Nullable(ListStatusEnum),
  score: t.Nullable(t.Number()),
  /** Episodes watched or chapters read. */
  progress: t.Number(),
  progressVolumes: t.Nullable(t.Number()),
  repeat: t.Number(),
  isFavorite: t.Boolean(),
  notes: t.Nullable(t.String()),
  startedAt: t.Nullable(FuzzyDateModel),
  completedAt: t.Nullable(FuzzyDateModel),
  createdAt: t.Date(),
  updatedAt: t.Date(),
});

/** Every field optional — a partial log preserves whatever it omits. */
export const LibraryEntryInputModel = t.Object({
  status: t.Optional(ListStatusEnum),
  score: t.Optional(t.Nullable(t.Number({ minimum: 1, maximum: 10 }))),
  progress: t.Optional(t.Number({ minimum: 0 })),
  progressVolumes: t.Optional(t.Nullable(t.Number({ minimum: 0 }))),
  repeat: t.Optional(t.Number({ minimum: 0 })),
  isFavorite: t.Optional(t.Boolean()),
  notes: t.Optional(t.Nullable(t.String())),
  startedAt: t.Optional(t.Nullable(FuzzyDateModel)),
  completedAt: t.Optional(t.Nullable(FuzzyDateModel)),
});

export const LibraryQueryModel = t.Object({
  type: t.Optional(MediaTypeParam),
  limit: t.Optional(t.Numeric({ minimum: 1, maximum: 100 })),
  offset: t.Optional(t.Numeric({ minimum: 0 })),
});

export type LibraryEntry = typeof LibraryEntryModel.static;
export type ListStatus = typeof ListStatusEnum.static;
