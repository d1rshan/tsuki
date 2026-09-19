import { t } from "elysia";

import { MediaTypeEnum } from "../media/model";

export const SyncStatusModel = t.Union([
  t.Literal("idle"),
  t.Literal("running"),
  t.Literal("failed"),
]);

export const SyncCursorModel = t.Object({
  offset: t.Number(),
  upserted: t.Optional(t.Number()),
});

export const SyncStateModel = t.Object({
  id: t.String(),
  status: SyncStatusModel,
  cursor: t.Nullable(SyncCursorModel),
  cursorUpdatedAt: t.Nullable(t.Date()),
  runStartedAt: t.Nullable(t.Date()),
  lastCompletedAt: t.Nullable(t.Date()),
  error: t.Nullable(t.String()),
});

export const SyncTickModel = t.Object({
  done: t.Boolean(),
  status: SyncStatusModel,
  upserted: t.Number(),
  nextOffset: t.Nullable(t.Number()),
});

export const SyncMediaTypeBody = t.Object({ mediaType: MediaTypeEnum });
