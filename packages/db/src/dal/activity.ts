import { and, asc, desc, eq, lt, or, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

import { db } from "../db";
import { feed, feedActivityTypeEnum, media, progress, social, user } from "../schema";
import type { FeedActivitySnapshot } from "../schema";

/**
 * Rows are stored by the progress trigger defined in
 * `src/triggers.ts` whenever library progress increases.
 */
export const getProgressActivity = async (userId: string) => {
  return db
    .select({
      date: progress.activityDate,
      mediaType: progress.mediaType,
      amount: progress.amount,
    })
    .from(progress)
    .where(eq(progress.userId, userId))
    .orderBy(asc(progress.activityDate));
};

export type FeedActivityType = (typeof feedActivityTypeEnum.enumValues)[number];

type FeedActivityInput = typeof feed.$inferInsert;

export const upsertFeedActivity = async (activity: FeedActivityInput) => {
  return db
    .insert(feed)
    .values(activity)
    .onConflictDoUpdate({
      target: [feed.actorId, feed.type, feed.sourceId],
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
    .delete(feed)
    .where(and(eq(feed.actorId, actorId), eq(feed.type, type), eq(feed.sourceId, sourceId)));
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
      id: feed.id,
      type: feed.type,
      snapshot: feed.snapshot,
      occurredAt: feed.occurredAt,
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
    .from(feed)
    .innerJoin(actor, eq(actor.id, feed.actorId))
    .leftJoin(media, and(eq(media.id, feed.mediaId), eq(media.type, feed.mediaType)))
    .leftJoin(target, eq(target.id, feed.targetUserId))
    .where(
      and(
        where,
        cursor
          ? or(
              lt(feed.occurredAt, cursor.occurredAt),
              and(eq(feed.occurredAt, cursor.occurredAt), lt(feed.id, cursor.id)),
            )
          : undefined,
      ),
    )
    .orderBy(desc(feed.occurredAt), desc(feed.id))
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
    sql`exists (select 1 from ${social} where ${social.followerId} = ${viewerId} and ${social.followingId} = ${feed.actorId})`,
    query,
  );
