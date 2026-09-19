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

/** Refresh every column from the incoming row, keeping only identity, createdAt
 * and the titleSearch generated column (Postgres forbids writing to those). */
const MEDIA_UPSERT_SET = Object.fromEntries(
  Object.entries(getTableColumns(media))
    .filter(([key]) => !["id", "type", "createdAt", "titleSearch"].includes(key))
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

/** Escape ILIKE metacharacters so a user-typed "%" doesn't match everything. */
const escapeIlike = (query: string) => query.replace(/[\\%_]/g, "\\$&");

/** Popularity-ordered trigram search over the titleSearch haystack. */
export const searchMedia = async (
  type: MediaType,
  query: string,
  { limit = 24, includeNsfw = false }: { limit?: number; includeNsfw?: boolean } = {},
) => {
  const pattern = `%${escapeIlike(query.trim())}%`;
  return db.query.media.findMany({
    columns: MEDIA_COMPACT_COLUMNS,
    where: and(
      eq(media.type, type),
      sql`${media.titleSearch} ILIKE ${pattern}`,
      // The table holds no nsfw rows yet; the filter stays so it works when it does.
      includeNsfw ? undefined : eq(media.nsfw, false),
    ),
    orderBy: sql`${media.popularity} desc nulls last`,
    limit,
  });
};
