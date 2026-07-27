import { and, desc, eq } from "drizzle-orm";

import { db } from "../db";
import { libraryEntries, type MediaType } from "../schema";
import { MEDIA_COMPACT_COLUMNS } from "./media";

export type InsertLibraryEntry = typeof libraryEntries.$inferInsert;

export type LibraryQueryOptions = {
  /** Omit to return anime and manga together, newest first. */
  type?: MediaType;
  limit?: number;
  offset?: number;
};

export const getEntry = async (userId: string, mediaId: number) => {
  return db.query.libraryEntries.findFirst({
    where: and(eq(libraryEntries.userId, userId), eq(libraryEntries.mediaId, mediaId)),
  });
};

export const getUserLibrary = async (userId: string, options: LibraryQueryOptions = {}) => {
  const { type, limit, offset } = options;

  return db.query.libraryEntries.findMany({
    where: type
      ? and(eq(libraryEntries.userId, userId), eq(libraryEntries.mediaType, type))
      : eq(libraryEntries.userId, userId),
    with: { media: { columns: MEDIA_COMPACT_COLUMNS } },
    orderBy: [desc(libraryEntries.updatedAt)],
    limit,
    offset,
  });
};

export const upsertEntry = async (entry: InsertLibraryEntry) => {
  const [result] = await db
    .insert(libraryEntries)
    .values(entry)
    .onConflictDoUpdate({
      target: [libraryEntries.userId, libraryEntries.mediaId],
      set: {
        // Undefined fields are omitted by drizzle, so a partial log preserves
        // whatever the entry already held.
        status: entry.status,
        score: entry.score,
        progress: entry.progress,
        progressVolumes: entry.progressVolumes,
        repeat: entry.repeat,
        isFavorite: entry.isFavorite,
        notes: entry.notes,
        startedAt: entry.startedAt,
        completedAt: entry.completedAt,
        // $onUpdate does not fire for onConflictDoUpdate, and the library is
        // ordered by this column, so it has to be stamped explicitly.
        updatedAt: new Date(),
      },
    })
    .returning();

  return result;
};

export const deleteEntry = async (userId: string, mediaId: number) => {
  return db
    .delete(libraryEntries)
    .where(and(eq(libraryEntries.userId, userId), eq(libraryEntries.mediaId, mediaId)));
};
