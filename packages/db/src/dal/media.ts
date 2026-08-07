import { and, eq, getTableColumns, sql } from "drizzle-orm";
import type { PgUpdateSetSource } from "drizzle-orm/pg-core";

import { db } from "../db";
import { media, type MediaType } from "../schema";

export type InsertMedia = typeof media.$inferInsert;

/** Trimmed column set for grids and media embedded in other rows. */
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

/** Refresh every column from the incoming row, keeping only identity and createdAt. */
const MEDIA_UPSERT_SET = Object.fromEntries(
  Object.entries(getTableColumns(media))
    .filter(([key]) => !["id", "type", "createdAt"].includes(key))
    .map(([key, column]) => [key, sql`excluded.${sql.identifier(column.name)}`]),
) as PgUpdateSetSource<typeof media>;

export const upsertMedia = async (rows: InsertMedia[]) => {
  // ON CONFLICT cannot touch the same row twice, so one repeated id fails the whole batch.
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
