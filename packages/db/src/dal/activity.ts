import { and, asc, desc, eq, like, lt, or, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

import { db } from "../db";
import { activity, activityTypeEnum, media, progress, social, user } from "../schema";

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

export type ActivityType = (typeof activityTypeEnum.enumValues)[number];

type ActivityInput = typeof activity.$inferInsert;

export const upsertActivity = async (row: ActivityInput) => {
  // Upserts replace the snapshot but never the occurredAt: Log bumps it to the
  // latest save by passing it in the insert, Review edits keep the original
  // date by leaving it out of the set entirely.
  return db
    .insert(activity)
    .values(row)
    .onConflictDoUpdate({
      target: [activity.actorId, activity.type, activity.sourceId],
      set: {
        mediaId: row.mediaId,
        mediaType: row.mediaType,
        snapshot: row.snapshot,
        ...(row.occurredAt ? { occurredAt: row.occurredAt } : {}),
      },
    });
};

export const deleteActivity = async (actorId: string, type: ActivityType, sourceId: string) => {
  return db
    .delete(activity)
    .where(
      and(eq(activity.actorId, actorId), eq(activity.type, type), eq(activity.sourceId, sourceId)),
    );
};

/** A Log is keyed per UTC day, so removing an entry removes all of its days. */
export const deleteActivityLogs = async (actorId: string, mediaId: number) => {
  return db
    .delete(activity)
    .where(
      and(
        eq(activity.actorId, actorId),
        eq(activity.type, "LOG"),
        like(activity.sourceId, `${mediaId}:%`),
      ),
    );
};

/**
 * The most recent Log cards for one actor+media, newest first — the day-range
 * baseline source. Today's row, when it exists, leads the list so the writer
 * can tell a same-day re-upsert from a new day.
 */
// ponytail: scans at most 10 rows back for a baseline with progress; deep
// score-only streaks longer than that lose their range (falls back to state
// phrasing). Paginate the scan if that ever matters.
export const getRecentLogs = async (actorId: string, mediaId: number, limit = 10) =>
  db
    .select({ sourceId: activity.sourceId, snapshot: activity.snapshot })
    .from(activity)
    .where(
      and(eq(activity.actorId, actorId), eq(activity.type, "LOG"), eq(activity.mediaId, mediaId)),
    )
    .orderBy(desc(activity.occurredAt), desc(activity.id))
    .limit(limit);

type ActivityQuery = { cursor?: { occurredAt: Date; id: string }; limit: number };

const actor = alias(user, "activity_actor");

// ponytail: keyset pagination on a mutable sort key — a Log re-logged while a
// viewer is mid-scroll bumps its occurredAt past their cursor, so that card
// quietly skips their session until a refresh. Known and accepted (the bump is
// per ADR 0003); if it ever matters, sort by time-sortable ids (UUIDv7) instead.
async function getActivity(
  where: ReturnType<typeof and> | ReturnType<typeof sql>,
  { cursor, limit }: ActivityQuery,
) {
  const rows = await db
    .select({
      id: activity.id,
      type: activity.type,
      snapshot: activity.snapshot,
      occurredAt: activity.occurredAt,
      // Rides even when the media join misses, so clients can still phrase the card.
      mediaType: activity.mediaType,
      actor: {
        username: actor.username,
        displayUsername: actor.displayUsername,
        image: actor.image,
      },
      media,
    })
    .from(activity)
    .innerJoin(actor, eq(actor.id, activity.actorId))
    .leftJoin(media, and(eq(media.id, activity.mediaId), eq(media.type, activity.mediaType)))
    .where(
      and(
        where,
        cursor
          ? or(
              lt(activity.occurredAt, cursor.occurredAt),
              and(eq(activity.occurredAt, cursor.occurredAt), lt(activity.id, cursor.id)),
            )
          : undefined,
      ),
    )
    .orderBy(desc(activity.occurredAt), desc(activity.id))
    .limit(limit + 1);

  const hasNextPage = rows.length > limit;
  if (hasNextPage) rows.pop();
  const next = hasNextPage ? rows.at(-1) : undefined;
  return {
    activities: rows,
    nextCursor: next ? { occurredAt: next.occurredAt, id: next.id } : null,
  };
}

/** One shared paginated query per actor: powers the profile activity stream. */
export const getUserActivity = (actorId: string, query: ActivityQuery) =>
  getActivity(eq(activity.actorId, actorId), query);

export const getPublicActivity = (query: ActivityQuery) => getActivity(sql`true`, query);

export const getFollowingActivity = (viewerId: string, query: ActivityQuery) =>
  getActivity(
    sql`exists (select 1 from ${social} where ${social.followerId} = ${viewerId} and ${social.followingId} = ${activity.actorId})`,
    query,
  );
