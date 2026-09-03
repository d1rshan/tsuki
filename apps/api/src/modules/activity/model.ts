import { t } from "elysia";

import { ListStatusEnum } from "../library/model";
import { MediaCompactModel, MediaTypeEnum } from "../media/model";

const ActivityActorModel = t.Object({
  username: t.String(),
  displayUsername: t.String(),
  image: t.Nullable(t.String()),
});

const ActivitySnapshotModel = t.Object({
  status: t.Optional(t.Nullable(ListStatusEnum)),
  score: t.Optional(t.Nullable(t.Number())),
  progress: t.Optional(t.Number()),
  /** Baseline the day's range opened from; the card states progressFrom+1 → progress. */
  progressFrom: t.Optional(t.Number()),
  progressVolumes: t.Optional(t.Nullable(t.Number())),
  /** Volume axis of the same day-range baseline. */
  progressVolumesFrom: t.Optional(t.Number()),
  repeat: t.Optional(t.Number()),
  /** Review documents ship pre-rendered; clients never parse the raw doc. */
  contentHtml: t.Optional(t.String()),
});

export const ActivityModel = t.Object({
  id: t.String(),
  type: t.Union([t.Literal("LOG"), t.Literal("REVIEW")]),
  snapshot: ActivitySnapshotModel,
  occurredAt: t.Date(),
  actor: ActivityActorModel,
  /** Present even when the media join misses, so cards can still phrase themselves. */
  mediaType: t.Nullable(MediaTypeEnum),
  media: t.Nullable(MediaCompactModel),
});

export const ActivityCursorQueryModel = t.Object({
  cursor: t.Optional(t.String()),
  limit: t.Optional(t.Numeric({ minimum: 1, maximum: 50, multipleOf: 1 })),
});

export const ActivityPageModel = t.Object({
  activities: t.Array(ActivityModel),
  nextCursor: t.Nullable(t.String()),
});

export type Activity = typeof ActivityModel.static;
