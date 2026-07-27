import { and, desc, eq, getTableColumns, ilike, or, sql } from "drizzle-orm";
import type { PgUpdateSetSource } from "drizzle-orm/pg-core";

import { db } from "../db";
import { media, type MediaType } from "../schema";

export type InsertMedia = typeof media.$inferInsert;

/** The trimmed column set used for search results, grids and embedded media. */
export const MEDIA_COMPACT_COLUMNS = {
  id: true,
  type: true,
  titleRomaji: true,
  titleEnglish: true,
  titleNative: true,
  coverImageExtraLarge: true,
  coverImageLarge: true,
  coverImageColor: true,
  bannerImage: true,
  format: true,
  episodes: true,
  chapters: true,
  seasonYear: true,
  averageScore: true,
} as const;

/** Identity columns, plus the one timestamp that must survive a refresh. */
const PRESERVED_ON_UPSERT = new Set(["id", "type", "createdAt"]);

/**
 * Refresh every other column from the incoming row. Derived from the table
 * definition so a new column can never be silently left out of the upsert.
 * `updatedAt` defaults to now() on the attempted insert, so taking it from
 * `excluded` stamps it correctly.
 */
const MEDIA_UPSERT_SET = Object.fromEntries(
  Object.entries(getTableColumns(media))
    .filter(([key]) => !PRESERVED_ON_UPSERT.has(key))
    .map(([key, column]) => [key, sql`excluded.${sql.identifier(column.name)}`]),
) as PgUpdateSetSource<typeof media>;

export const upsertMedia = async (rows: InsertMedia[]) => {
  if (rows.length === 0) return;

  return db.insert(media).values(rows).onConflictDoUpdate({
    target: media.id,
    set: MEDIA_UPSERT_SET,
  });
};

export const getMediaById = async (type: MediaType, id: number) => {
  return db.query.media.findFirst({
    where: and(eq(media.id, id), eq(media.type, type)),
  });
};

export const searchMedia = async (type: MediaType, query: string, limit = 24) => {
  if (!query) return [];

  const pattern = `%${query}%`;
  return db.query.media.findMany({
    where: and(
      eq(media.type, type),
      or(ilike(media.titleRomaji, pattern), ilike(media.titleEnglish, pattern)),
    ),
    limit,
    orderBy: [desc(media.popularity)],
    columns: MEDIA_COMPACT_COLUMNS,
  });
};
