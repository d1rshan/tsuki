import { and, desc, eq, lt, or, sql } from "drizzle-orm";

import { db } from "../db";
import { media, reviews, social, user, type MediaType } from "../schema";
import { MEDIA_COMPACT_COLUMNS, MEDIA_COMPACT_SELECT } from "./media";

export type InsertReview = typeof reviews.$inferInsert;
export type ReviewFeedCursor = { createdAt: Date; id: string };

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
  cursor,
}: {
  viewerId?: string;
  limit: number;
  cursor?: ReviewFeedCursor;
}) => {
  const rows = await db
    .select({
      id: reviews.id,
      mediaId: reviews.mediaId,
      mediaType: reviews.mediaType,
      content: reviews.content,
      createdAt: reviews.createdAt,
      updatedAt: reviews.updatedAt,
      media: MEDIA_COMPACT_SELECT,
      author: { username: user.username, displayUsername: user.displayUsername, image: user.image },
    })
    .from(reviews)
    .innerJoin(user, eq(user.id, reviews.userId))
    .leftJoin(media, and(eq(media.id, reviews.mediaId), eq(media.type, reviews.mediaType)))
    .where(
      and(
        viewerId
          ? sql`exists (select 1 from ${social} where ${social.followerId} = ${viewerId}
              and ${social.followingId} = ${reviews.userId})`
          : eq(user.isPrivate, false),
        cursor
          ? or(
              lt(reviews.createdAt, cursor.createdAt),
              and(eq(reviews.createdAt, cursor.createdAt), lt(reviews.id, cursor.id)),
            )
          : undefined,
      ),
    )
    .orderBy(desc(reviews.createdAt), desc(reviews.id))
    .limit(limit + 1);
  const hasMore = rows.length > limit;
  const page = rows.slice(0, limit);
  const last = hasMore ? page.at(-1) : undefined;
  return {
    reviews: page,
    nextCursor: last ? { createdAt: last.createdAt, id: last.id } : null,
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
