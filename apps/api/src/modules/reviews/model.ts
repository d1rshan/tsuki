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

export const ReviewFeedItemModel = t.Composite([
  ReviewModel,
  t.Object({
    author: t.Object({
      username: t.String(),
      displayUsername: t.String(),
      image: t.Nullable(t.String()),
    }),
  }),
]);

export const ReviewFeedQueryModel = t.Object({
  limit: t.Optional(t.Numeric({ minimum: 1, maximum: 20, multipleOf: 1 })),
  cursor: t.Optional(t.String()),
});

export const ReviewFeedPageModel = t.Object({
  reviews: t.Array(ReviewFeedItemModel),
  nextCursor: t.Nullable(t.String()),
});

export type ReviewFeedItem = typeof ReviewFeedItemModel.static;
