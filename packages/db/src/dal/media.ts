import { and, eq, getTableColumns, sql } from "drizzle-orm";
import type { PgUpdateSetSource } from "drizzle-orm/pg-core";

import { db } from "../db";
import { media, type MediaType } from "../schema";

export type InsertMedia = typeof media.$inferInsert;

/** The trimmed column set used for grids and media embedded in other rows. */
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

/** A `media` row narrowed to {@link MEDIA_COMPACT_COLUMNS}. */
export type MediaCompactRow = Pick<typeof media.$inferSelect, keyof typeof MEDIA_COMPACT_COLUMNS>;

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

/**
 * Postgres rejects a statement whose ON CONFLICT would touch the same row twice
 * ("cannot affect row a second time"), so one repeated id fails the whole batch.
 * Callers assembling rows from paginated sources can't always guarantee
 * uniqueness, so collapse duplicates here rather than trusting every caller.
 */
export const upsertMedia = async (rows: InsertMedia[]) => {
  const unique = [...new Map(rows.map((row) => [row.id, row])).values()];
  if (unique.length === 0) return;

  return db.insert(media).values(unique).onConflictDoUpdate({
    target: media.id,
    set: MEDIA_UPSERT_SET,
  });
};

export const getMediaById = async (type: MediaType, id: number) => {
  return db.query.media.findFirst({
    where: and(eq(media.id, id), eq(media.type, type)),
  });
};
