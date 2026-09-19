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

/** Nullable enrichment fields a bulk sync page can't fill (Kitsu list pages
 * carry no categories/links). Keep the stored value instead of wiping it. */
const ENRICHMENT_COLUMNS = new Set(["genres", "externalLinks", "trailer", "description"]);

/** Refresh every column from the incoming row, keeping only identity, createdAt
 * and the titleSearch generated column (Postgres forbids writing to those). */
const MEDIA_UPSERT_SET = Object.fromEntries(
  Object.entries(getTableColumns(media))
    .filter(([key]) => !["id", "type", "createdAt", "titleSearch"].includes(key))
    .map(([key, column]) => [
      key,
      ENRICHMENT_COLUMNS.has(key)
        ? sql`coalesce(excluded.${sql.identifier(column.name)}, ${column})`
        : sql`excluded.${sql.identifier(column.name)}`,
    ]),
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

/** Our ranking: "what's popular here" (ADR 0004), replacing AniList's
 * TRENDING_DESC. Non-NSFW only, newest crawl is the freshness ceiling. */
export const listTrending = async (type: MediaType, limit = 70) => {
  return db.query.media.findMany({
    columns: MEDIA_COMPACT_COLUMNS,
    where: and(eq(media.type, type), eq(media.nsfw, false)),
    orderBy: sql`${media.popularity} desc nulls last`,
    limit,
  });
};

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
