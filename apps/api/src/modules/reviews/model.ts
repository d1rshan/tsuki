import { t } from "elysia";

import { MediaCompactModel, MediaTypeParam } from "../media/model";

export const ReviewModel = t.Object({
  id: t.String(),
  mediaType: MediaTypeParam,
  mediaId: t.Number(),
  media: t.Nullable(MediaCompactModel),
  content: t.String(),
  containsSpoilers: t.Boolean(),
  createdAt: t.Date(),
  updatedAt: t.Date(),
});

export const ReviewInputModel = t.Object({
  content: t.String({ minLength: 1 }),
  containsSpoilers: t.Optional(t.Boolean()),
});

export const ReviewQueryModel = t.Object({
  type: t.Optional(MediaTypeParam),
  limit: t.Optional(t.Numeric({ minimum: 1, maximum: 100 })),
  offset: t.Optional(t.Numeric({ minimum: 0 })),
});

export type Review = typeof ReviewModel.static;
