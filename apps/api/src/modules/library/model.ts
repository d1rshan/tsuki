import { LIST_STATUSES } from "@tsuki/anilist";
import { t } from "elysia";

import { FuzzyDateModel, MediaCompactModel, MediaTypeEnum } from "../media/model";

/**
 * `default: undefined` overrides UnionEnum's implicit `default: values[0]`:
 * Elysia fills omitted UnionEnum members with that default, which silently
 * turned a favorite-only save (`{ isFavorite: true }`) into a "CURRENT" log entry.
 */
export const ListStatusEnum = t.UnionEnum(LIST_STATUSES, { default: undefined });

export const LibraryEntryModel = t.Object({
  mediaType: MediaTypeEnum,
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
  type: t.Optional(MediaTypeEnum),
  limit: t.Optional(t.Numeric({ minimum: 1, maximum: 100 })),
  offset: t.Optional(t.Numeric({ minimum: 0 })),
});

export type LibraryEntry = typeof LibraryEntryModel.static;
export type ListStatus = typeof ListStatusEnum.static;
