import { t } from "elysia";

import { MediaCompactModel, MediaTypeEnum } from "../media/model";
import { RichContentModel } from "../rich-content/model";

export const ReviewModel = t.Object({
  id: t.String(),
  mediaType: MediaTypeEnum,
  mediaId: t.Number(),
  media: t.Nullable(MediaCompactModel),
  content: RichContentModel,
  createdAt: t.Date(),
  updatedAt: t.Date(),
});

export const ReviewInputModel = t.Object({
  content: RichContentModel,
});

export const ReviewQueryModel = t.Object({
  type: t.Optional(MediaTypeEnum),
  limit: t.Optional(t.Numeric({ minimum: 1, maximum: 100 })),
  offset: t.Optional(t.Numeric({ minimum: 0 })),
});

export type Review = typeof ReviewModel.static;
