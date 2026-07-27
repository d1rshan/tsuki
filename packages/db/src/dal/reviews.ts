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
    with: { media: { columns: MEDIA_COMPACT_COLUMNS } },
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

/**
 * Conflicts resolve on (userId, mediaId), not the primary key, so the `id` on an
 * incoming review is only used when the row is new — editing an existing review
 * discards it. Read the id back off the returned row rather than assuming it is
 * the one you passed in.
 */
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
