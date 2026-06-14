import { Elysia } from "elysia";
import { cron } from "@elysiajs/cron";
import { animeDal } from "@tsuki/db";
import { TrendingAnimeResponseModel } from "./model";
import { anilistClient } from "../../anilist/client";
import { TRENDING_ANIME_QUERY, type TrendingQueryResponse } from "../../anilist/queries/trending";
import { toAnimeRow } from "../../anilist/mappers";

export async function syncTrendingAnime() {
  console.log("[Sync] Fetching trending anime...");
  try {
    const data = await anilistClient.request<TrendingQueryResponse>(TRENDING_ANIME_QUERY);

    const media = data.Page?.media || [];

    if (media.length === 0) return { success: true, count: 0 };

    const animesData = media.flatMap((anime) => {
      if (!anime) return [];
      return [toAnimeRow(anime)];
    });

    // Upsert anime into main table
    await animeDal.upsertAnimes(animesData);

    // Update trending list
    const animeIds = animesData.map((anime) => anime.id);
    await animeDal.setTrendingAnime(animeIds);

    console.log(`[Sync] Successfully updated ${media.length} trending anime.`);
    return { success: true, count: media.length };
  } catch (error) {
    console.error("[Sync] Failed to update trending anime:", error);
    throw error;
  }
}

export const animeRoutes = new Elysia({ prefix: "/anime" })
  .use(
    cron({
      name: "update-trending-anime",
      pattern: "0 0 * * *", // Runs every day at midnight
      async run() {
        await syncTrendingAnime().catch((err) => console.error("[Sync] Cron update failed:", err));
      },
    }),
  )
  .get(
    "/trending",
    async () => {
      return await animeDal.getTrendingAnime();
    },
    {
      response: TrendingAnimeResponseModel,
      detail: {
        summary: "Get Trending Anime",
        description: "Retrieves the daily trending anime directly from the database.",
      },
    },
  );
