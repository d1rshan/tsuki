import { and, count, desc, eq, sum } from "drizzle-orm";

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

export function progressAdded(previous: number, next: number | undefined) {
  return next === undefined ? 0 : Math.max(0, next - previous);
}

export const upsertEntry = async (entry: InsertLibraryEntry) => {
  const current = await db.query.libraryEntries.findFirst({
    columns: { progress: true },
    where: and(eq(libraryEntries.userId, entry.userId), eq(libraryEntries.mediaId, entry.mediaId)),
  });
  const amount = progressAdded(current?.progress ?? 0, entry.progress);
  const upsert = db
    .insert(libraryEntries)
    .values(entry)
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
        updatedAt: new Date(),
      },
    })
    .returning();

  if (!amount) {
    const [result] = await upsert;
    return result;
  }

  const [results] = await db.batch([
    upsert,
    db.insert(progressActivity).values({
      userId: entry.userId,
      mediaType: entry.mediaType,
      amount,
    }),
  ]);

  return results[0];
};

export const deleteEntry = async (userId: string, mediaId: number) => {
  return db
    .delete(libraryEntries)
    .where(and(eq(libraryEntries.userId, userId), eq(libraryEntries.mediaId, mediaId)));
};
