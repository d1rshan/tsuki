import { and, asc, desc, eq, lt, or, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

import { db } from "../db";
import {
  feedActivities,
  feedActivityTypeEnum,
  media,
  progressActivity,
  social,
  user,
} from "../schema";
import type { FeedActivitySnapshot } from "../schema";

/**
 * Rows are stored by the progress trigger defined in
 * `drizzle/0001_record_progress_activity.sql` whenever library progress increases.
 */
export const getProgressActivity = async (userId: string) => {
  return db
    .select({
      date: progressActivity.activityDate,
      mediaType: progressActivity.mediaType,
      amount: progressActivity.amount,
    })
    .from(progressActivity)
    .where(eq(progressActivity.userId, userId))
    .orderBy(asc(progressActivity.activityDate));
};

export type FeedActivityType = (typeof feedActivityTypeEnum.enumValues)[number];

type FeedActivityInput = typeof feedActivities.$inferInsert;

export const upsertFeedActivity = async (activity: FeedActivityInput) => {
  return db
    .insert(feedActivities)
    .values(activity)
    .onConflictDoUpdate({
      target: [feedActivities.actorId, feedActivities.type, feedActivities.sourceId],
      set: {
        mediaId: activity.mediaId,
        mediaType: activity.mediaType,
        targetUserId: activity.targetUserId,
        snapshot: activity.snapshot,
      },
    });
};

export const deleteFeedActivity = async (
  actorId: string,
  type: FeedActivityType,
  sourceId: string,
) => {
  return db
    .delete(feedActivities)
    .where(
      and(
        eq(feedActivities.actorId, actorId),
        eq(feedActivities.type, type),
        eq(feedActivities.sourceId, sourceId),
      ),
    );
};

type FeedQuery = { cursor?: { occurredAt: Date; id: string }; limit: number };

const actor = alias(user, "activity_actor");
const target = alias(user, "activity_target");

async function getFeed(
  where: ReturnType<typeof and> | ReturnType<typeof sql>,
  { cursor, limit }: FeedQuery,
) {
  const rows = await db
    .select({
      id: feedActivities.id,
      type: feedActivities.type,
      snapshot: feedActivities.snapshot,
      occurredAt: feedActivities.occurredAt,
      actor: {
        username: actor.username,
        displayUsername: actor.displayUsername,
        image: actor.image,
      },
      media,
      target: {
        username: target.username,
        displayUsername: target.displayUsername,
      },
    })
    .from(feedActivities)
    .innerJoin(actor, eq(actor.id, feedActivities.actorId))
    .leftJoin(
      media,
      and(eq(media.id, feedActivities.mediaId), eq(media.type, feedActivities.mediaType)),
    )
    .leftJoin(target, eq(target.id, feedActivities.targetUserId))
    .where(
      and(
        where,
        cursor
          ? or(
              lt(feedActivities.occurredAt, cursor.occurredAt),
              and(
                eq(feedActivities.occurredAt, cursor.occurredAt),
                lt(feedActivities.id, cursor.id),
              ),
            )
          : undefined,
      ),
    )
    .orderBy(desc(feedActivities.occurredAt), desc(feedActivities.id))
    .limit(limit + 1);

  const hasNextPage = rows.length > limit;
  if (hasNextPage) rows.pop();
  const next = hasNextPage ? rows.at(-1) : undefined;
  return {
    activities: rows,
    nextCursor: next ? { occurredAt: next.occurredAt, id: next.id } : null,
  };
}

export const getPublicFeed = (query: FeedQuery) => getFeed(sql`true`, query);

export const getFollowingFeed = (viewerId: string, query: FeedQuery) =>
  getFeed(
    sql`exists (select 1 from ${social} where ${social.followerId} = ${viewerId} and ${social.followingId} = ${feedActivities.actorId})`,
    query,
  );
