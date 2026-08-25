import { t } from "elysia";

import { ListStatusEnum } from "../library/model";
import { MediaCompactModel } from "../media/model";

const FeedActorModel = t.Object({
  username: t.String(),
  displayUsername: t.String(),
  image: t.Nullable(t.String()),
});

const FeedSnapshotModel = t.Object({
  status: t.Optional(t.Nullable(ListStatusEnum)),
  score: t.Optional(t.Nullable(t.Number())),
  progress: t.Optional(t.Number()),
  progressVolumes: t.Optional(t.Nullable(t.Number())),
  repeat: t.Optional(t.Number()),
  content: t.Optional(t.String()),
  containsSpoilers: t.Optional(t.Boolean()),
});

export const FeedActivityModel = t.Object({
  id: t.String(),
  type: t.Union([t.Literal("LOG"), t.Literal("REVIEW"), t.Literal("FOLLOW")]),
  snapshot: FeedSnapshotModel,
  occurredAt: t.Date(),
  actor: FeedActorModel,
  media: t.Nullable(MediaCompactModel),
  target: t.Nullable(t.Object({ username: t.String(), displayUsername: t.String() })),
});

export const FeedQueryModel = t.Object({
  type: t.Union([t.Literal("following"), t.Literal("public")]),
  cursor: t.Optional(t.String()),
  limit: t.Optional(t.Numeric({ minimum: 1, maximum: 50, multipleOf: 1 })),
});

export const FeedModel = t.Object({
  activities: t.Array(FeedActivityModel),
  nextCursor: t.Nullable(t.String()),
});

export type FeedActivity = typeof FeedActivityModel.static;
