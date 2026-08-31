import { t } from "elysia";

import { ListStatusEnum } from "../library/model";
import { MediaCompactModel } from "../media/model";

const ActivityActorModel = t.Object({
  username: t.String(),
  displayUsername: t.String(),
  image: t.Nullable(t.String()),
});

const ActivitySnapshotModel = t.Object({
  status: t.Optional(t.Nullable(ListStatusEnum)),
  score: t.Optional(t.Nullable(t.Number())),
  progress: t.Optional(t.Number()),
  progressVolumes: t.Optional(t.Nullable(t.Number())),
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
  media: t.Nullable(MediaCompactModel),
});

export const ActivityCursorQueryModel = t.Object({
  cursor: t.Optional(t.String()),
  limit: t.Optional(t.Numeric({ minimum: 1, maximum: 50, multipleOf: 1 })),
});

export const ActivityFeedQueryModel = t.Object({
  ...ActivityCursorQueryModel.properties,
  type: t.Union([t.Literal("following"), t.Literal("public")]),
});

export const ActivityPageModel = t.Object({
  activities: t.Array(ActivityModel),
  nextCursor: t.Nullable(t.String()),
});

export type Activity = typeof ActivityModel.static;
