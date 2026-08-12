import { and, count, desc, eq, sql, sum } from "drizzle-orm";

import { db } from "../db";
import { libraryEntries, progressActivity, type MediaType } from "../schema";
import { MEDIA_COMPACT_COLUMNS } from "./media";

export type InsertLibraryEntry = typeof libraryEntries.$inferInsert;

export type LibraryQueryOptions = {
  /** Omit to return anime and manga together, newest first. */
  type?: MediaType;
  isFavorite?: boolean;
  limit?: number;
  offset?: number;
};

export const getEntry = async (userId: string, mediaId: number) => {
  return db.query.libraryEntries.findFirst({
    where: and(eq(libraryEntries.userId, userId), eq(libraryEntries.mediaId, mediaId)),
    columns: { activityProgress: false },
    with: { media: { columns: MEDIA_COMPACT_COLUMNS } },
  });
};

export const getUserLibrary = async (userId: string, options: LibraryQueryOptions = {}) => {
  const { type, isFavorite, limit, offset } = options;

  return db.query.libraryEntries.findMany({
    // `and` drops the undefined conditions, so each filter is opt-in.
    where: and(
      eq(libraryEntries.userId, userId),
      type ? eq(libraryEntries.mediaType, type) : undefined,
      isFavorite ? eq(libraryEntries.isFavorite, true) : undefined,
    ),
    columns: { activityProgress: false },
    with: { media: { columns: MEDIA_COMPACT_COLUMNS } },
    orderBy: [desc(libraryEntries.updatedAt)],
    limit,
    offset,
  });
};

/**
 * Per-type totals, counted in the database rather than by pulling the whole
 * library. Sums only — what a mean is, and what an empty one should read as,
 * is the caller's decision.
 */
export const getLibraryStats = async (userId: string) => {
  return db
    .select({
      mediaType: libraryEntries.mediaType,
      total: count(),
      progress: sum(libraryEntries.progress).mapWith(Number),
      /** Counts non-null scores, so unscored entries are excluded. */
      scoredCount: count(libraryEntries.score),
      scoreSum: sum(libraryEntries.score).mapWith(Number),
    })
    .from(libraryEntries)
    .where(eq(libraryEntries.userId, userId))
    .groupBy(libraryEntries.mediaType);
};

export type LibraryStatsRow = Awaited<ReturnType<typeof getLibraryStats>>[number];

export const upsertEntry = async (entry: InsertLibraryEntry) => {
  const upsert = db
    .insert(libraryEntries)
    .values({ ...entry, activityProgress: 0 })
    .onConflictDoUpdate({
      target: [libraryEntries.userId, libraryEntries.mediaId],
      set: {
        status: entry.status,
        score: entry.score,
        progress: entry.progress,
        progressVolumes: entry.progressVolumes,
        repeat: entry.repeat,
        isFavorite: entry.isFavorite,
        notes: entry.notes,
        startedAt: entry.startedAt,
        completedAt: entry.completedAt,
        // Existing rows start with a null cursor after deployment. Seed it from
        // the old progress before applying the new value so nothing is backfilled.
        activityProgress: sql`coalesce(${libraryEntries.activityProgress}, ${libraryEntries.progress})`,
        updatedAt: new Date(),
      },
    })
    .returning();

  if (entry.progress === undefined) {
    const [result] = await upsert;
    return result;
  }

  // neon-http batches run in one transaction. The upsert locks this entry
  // before this statement advances its cursor, serializing concurrent saves.
  const [results] = await db.batch([
    upsert,
    db.execute(sql`
    with current_progress as (
      select ${libraryEntries.progress} as progress,
             ${libraryEntries.activityProgress} as activity_progress
      from ${libraryEntries}
      where ${libraryEntries.userId} = ${entry.userId}
        and ${libraryEntries.mediaId} = ${entry.mediaId}
    ), advanced_progress as (
      update ${libraryEntries}
      set activity_progress = current_progress.progress
      from current_progress
      where ${libraryEntries.userId} = ${entry.userId}
        and ${libraryEntries.mediaId} = ${entry.mediaId}
      returning current_progress.progress - current_progress.activity_progress as amount
    )
    insert into ${progressActivity} (user_id, media_type, amount)
    select ${entry.userId}, ${entry.mediaType}, amount
    from advanced_progress
    where amount > 0
    on conflict (user_id, media_type, activity_date)
    do update set amount = progress_activity.amount + excluded.amount
  `),
  ]);
  return results[0];
};

export const deleteEntry = async (userId: string, mediaId: number) => {
  return db
    .delete(libraryEntries)
    .where(and(eq(libraryEntries.userId, userId), eq(libraryEntries.mediaId, mediaId)));
};
