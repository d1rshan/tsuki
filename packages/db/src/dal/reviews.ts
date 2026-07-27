import { and, desc, eq } from "drizzle-orm";

import { db } from "../db";
import { reviews, type MediaType } from "../schema";
import { MEDIA_COMPACT_COLUMNS } from "./media";

export type InsertReview = typeof reviews.$inferInsert;

export type ReviewQueryOptions = {
  /** Omit to return anime and manga reviews together, newest first. */
  type?: MediaType;
  limit?: number;
  offset?: number;
};

export const getReview = async (userId: string, mediaId: number) => {
  return db.query.reviews.findFirst({
    where: and(eq(reviews.userId, userId), eq(reviews.mediaId, mediaId)),
  });
};

export const getUserReviews = async (userId: string, options: ReviewQueryOptions = {}) => {
  const { type, limit, offset } = options;

  return db.query.reviews.findMany({
    where: type
      ? and(eq(reviews.userId, userId), eq(reviews.mediaType, type))
      : eq(reviews.userId, userId),
    with: { media: { columns: MEDIA_COMPACT_COLUMNS } },
    orderBy: [desc(reviews.createdAt)],
    limit,
    offset,
  });
};

export const upsertReview = async (review: InsertReview) => {
  const [result] = await db
    .insert(reviews)
    .values(review)
    .onConflictDoUpdate({
      target: [reviews.userId, reviews.mediaId],
      set: {
        content: review.content,
        containsSpoilers: review.containsSpoilers,
        updatedAt: new Date(),
      },
    })
    .returning();

  return result;
};

export const deleteReview = async (userId: string, mediaId: number) => {
  return db.delete(reviews).where(and(eq(reviews.userId, userId), eq(reviews.mediaId, mediaId)));
};
