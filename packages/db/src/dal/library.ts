import { and, count, desc, eq, sum } from "drizzle-orm";

import { db } from "../db";
import { library, type MediaType } from "../schema";
import { MEDIA_COMPACT_COLUMNS } from "./media";

export type InsertLibraryEntry = typeof library.$inferInsert;

export type LibraryQueryOptions = {
  /** Omit to return anime and manga together, newest first. */
  type?: MediaType;
  isFavorite?: boolean;
  limit?: number;
  offset?: number;
};

export const getEntry = async (userId: string, mediaId: number) => {
  return db.query.library.findFirst({
    where: and(eq(library.userId, userId), eq(library.mediaId, mediaId)),
    with: { media: { columns: MEDIA_COMPACT_COLUMNS } },
  });
};

export const getUserLibrary = async (userId: string, options: LibraryQueryOptions = {}) => {
  const { type, isFavorite, limit, offset } = options;

  return db.query.library.findMany({
    // `and` drops the undefined conditions, so each filter is opt-in.
    where: and(
      eq(library.userId, userId),
      type ? eq(library.mediaType, type) : undefined,
      isFavorite ? eq(library.isFavorite, true) : undefined,
    ),
    with: { media: { columns: MEDIA_COMPACT_COLUMNS } },
    orderBy: [desc(library.updatedAt)],
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
      mediaType: library.mediaType,
      total: count(),
      progress: sum(library.progress).mapWith(Number),
      /** Counts non-null scores, so unscored entries are excluded. */
      scoredCount: count(library.score),
      scoreSum: sum(library.score).mapWith(Number),
    })
    .from(library)
    .where(eq(library.userId, userId))
    .groupBy(library.mediaType);
};

export type LibraryStatsRow = Awaited<ReturnType<typeof getLibraryStats>>[number];

/**
 * Progress activity is recorded by the trigger in
 * `drizzle/0001_record_progress_activity.sql`. Keeping it in PostgreSQL avoids
 * an extra cursor column: neon-http has no interactive transaction for locking
 * the entry, reading its old progress, and updating both tables atomically.
 */
export const upsertEntry = async (entry: InsertLibraryEntry) => {
  const [result] = await db
    .insert(library)
    .values(entry)
    .onConflictDoUpdate({
      target: [library.userId, library.mediaId],
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
        updatedAt: new Date(),
      },
    })
    .returning();
  return result;
};

export const deleteEntry = async (userId: string, mediaId: number) => {
  return db.delete(library).where(and(eq(library.userId, userId), eq(library.mediaId, mediaId)));
};
