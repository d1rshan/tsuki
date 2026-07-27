import { sql, eq, ilike, or } from "drizzle-orm";

import { db } from "../db";
import { manga } from "../schema";

type InsertManga = typeof manga.$inferInsert;

export const upsertMangas = async (mangasData: InsertManga[]) => {
  if (mangasData.length === 0) return;

  return db
    .insert(manga)
    .values(mangasData)
    .onConflictDoUpdate({
      target: manga.id,
      set: {
        titleRomaji: sql`excluded.title_romaji`,
        titleEnglish: sql`excluded.title_english`,
        titleNative: sql`excluded.title_native`,
        description: sql`excluded.description`,
        coverImageExtraLarge: sql`excluded.cover_image_extra_large`,
        coverImageLarge: sql`excluded.cover_image_large`,
        coverImageColor: sql`excluded.cover_image_color`,
        bannerImage: sql`excluded.banner_image`,
        format: sql`excluded.format`,
        status: sql`excluded.status`,
        chapters: sql`excluded.chapters`,
        volumes: sql`excluded.volumes`,
        season: sql`excluded.season`,
        seasonYear: sql`excluded.season_year`,
        averageScore: sql`excluded.average_score`,
        meanScore: sql`excluded.mean_score`,
        popularity: sql`excluded.popularity`,
        trending: sql`excluded.trending`,
        genres: sql`excluded.genres`,
        trailer: sql`excluded.trailer`,
        externalLinks: sql`excluded.external_links`,
        isAdult: sql`excluded.is_adult`,
        updatedAt: sql`now()`,
      },
    });
};

export const getMangaById = async (id: number) => {
  return db.query.manga.findFirst({
    where: eq(manga.id, id),
  });
};

export const searchManga = async (query: string, limit = 24) => {
  if (!query) return [];

  const searchPattern = `%${query}%`;
  return db.query.manga.findMany({
    where: or(ilike(manga.titleRomaji, searchPattern), ilike(manga.titleEnglish, searchPattern)),
    limit,
    orderBy: (manga, { desc }) => [desc(manga.popularity)],
    columns: {
      id: true,
      titleRomaji: true,
      titleEnglish: true,
      titleNative: true,
      coverImageExtraLarge: true,
      coverImageLarge: true,
      bannerImage: true,
      seasonYear: true,
      chapters: true,
      averageScore: true,
    },
  });
};
