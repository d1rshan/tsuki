import { and, desc, eq, sql } from "drizzle-orm";

import { db } from "../db";
import { media, reviews, social, user, type MediaType } from "../schema";
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

/** Full reviews, scoped to public Profiles or the viewer's current Follows. */
export const getRecentReviews = async ({
  viewerId,
  limit,
  offset,
}: {
  viewerId?: string;
  limit: number;
  offset: number;
}) => {
  const rows = await db
    .select({
      id: reviews.id,
      mediaId: reviews.mediaId,
      mediaType: reviews.mediaType,
      content: reviews.content,
      createdAt: reviews.createdAt,
      updatedAt: reviews.updatedAt,
      media,
      author: { username: user.username, displayUsername: user.displayUsername, image: user.image },
    })
    .from(reviews)
    .innerJoin(user, eq(user.id, reviews.userId))
    .leftJoin(media, and(eq(media.id, reviews.mediaId), eq(media.type, reviews.mediaType)))
    .where(
      viewerId
        ? sql`exists (select 1 from ${social} where ${social.followerId} = ${viewerId}
            and ${social.followingId} = ${reviews.userId})`
        : eq(user.isPrivate, false),
    )
    .orderBy(desc(reviews.createdAt), desc(reviews.id))
    .limit(limit + 1)
    .offset(offset);
  const hasMore = rows.length > limit;
  return {
    reviews: rows.slice(0, limit),
    nextOffset: hasMore ? offset + limit : null,
  };
};

/** Conflicts resolve on (userId, mediaId), so an incoming `id` is ignored on edits. */
export const upsertReview = async (review: InsertReview) => {
  const [result] = await db
    .insert(reviews)
    .values(review)
    .onConflictDoUpdate({
      target: [reviews.userId, reviews.mediaId],
      set: {
        content: review.content,
        updatedAt: new Date(),
      },
    })
    .returning();

  return result;
};

export const deleteReview = async (userId: string, mediaId: number) => {
  return db.delete(reviews).where(and(eq(reviews.userId, userId), eq(reviews.mediaId, mediaId)));
};
