import { sql } from "drizzle-orm";
import { db } from "../db";
import { anime, trendingAnime } from "../schema";

export type InsertAnime = typeof anime.$inferInsert;

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
        tags: sql`excluded.tags`,
        isAdult: sql`excluded.is_adult`,
        updatedAt: sql`now()`,
      },
    });
};

export const setTrendingAnime = async (animeIds: number[]) => {
  if (animeIds.length === 0) return;

  // We perform this in a transaction: delete all existing trending, then insert new.
  return db.transaction(async (tx) => {
    await tx.delete(trendingAnime);

    const trendingData = animeIds.map((id, index) => ({
      animeId: id,
      position: index + 1,
    }));

    await tx.insert(trendingAnime).values(trendingData);
  });
};

export const getTrendingAnime = async () => {
  const data = await db.query.trendingAnime.findMany({
    orderBy: (trendingAnime, { asc }) => [asc(trendingAnime.position)],
    with: {
      anime: true,
    },
  });

  return data.map((d) => d.anime);
};
