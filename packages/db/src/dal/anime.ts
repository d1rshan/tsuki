import { sql, eq, ilike, or } from "drizzle-orm";

import { db } from "../db";
import { anime } from "../schema";

type InsertAnime = typeof anime.$inferInsert;

export const upsertAnimes = async (animesData: InsertAnime[]) => {
  if (animesData.length === 0) return;

  return db
    .insert(anime)
    .values(animesData)
    .onConflictDoUpdate({
      target: anime.id,
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
        episodes: sql`excluded.episodes`,
        duration: sql`excluded.duration`,
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

export const getAnimeById = async (id: number) => {
  return db.query.anime.findFirst({
    where: eq(anime.id, id),
  });
};

export const searchAnime = async (query: string, limit = 24) => {
  if (!query) return [];

  const searchPattern = `%${query}%`;
  return db.query.anime.findMany({
    where: or(ilike(anime.titleRomaji, searchPattern), ilike(anime.titleEnglish, searchPattern)),
    limit,
    orderBy: (anime, { desc }) => [desc(anime.popularity)],
    columns: {
      id: true,
      titleRomaji: true,
      titleEnglish: true,
      titleNative: true,
      coverImageExtraLarge: true,
      coverImageLarge: true,
      bannerImage: true,
      seasonYear: true,
      episodes: true,
      averageScore: true,
    },
  });
};
