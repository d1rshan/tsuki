import { Elysia, t } from "elysia";
import { cron } from "@elysiajs/cron";
import { animeDal } from "@tsuki/db";
import { AnimeModel, TrendingAnimeResponseModel } from "./model";
import { anilistClient } from "../../anilist/client";
import { TRENDING_ANIME_QUERY, type TrendingQueryResponse } from "../../anilist/queries/trending";
import { ANIME_BY_ID_QUERY, type AnimeByIdResponse } from "../../anilist/queries/anime-by-id";
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
  )
  .get(
    "/search",
    async ({ query }) => {
      const q = query.q as string;
      return await animeDal.searchAnime(q);
    },
    {
      query: t.Object({
        q: t.String({ description: "Search query string" }),
      }),
      response: t.Array(AnimeModel),
      detail: {
        summary: "Search Anime",
        description: "Searches for anime in the database matching the query.",
      },
    },
  )
  .get(
    "/:id",
    async ({ params: { id }, set }) => {
      let anime = await animeDal.getAnimeById(id);

      // Read-through cache: if not in DB, fetch from Anilist, save to DB, then return
      if (!anime) {
        try {
          const data = await anilistClient.request<AnimeByIdResponse>(ANIME_BY_ID_QUERY, { id });

          if (data.Media) {
            const row = toAnimeRow(data.Media);
            await animeDal.upsertAnimes([row]);
            anime = await animeDal.getAnimeById(id);
          }
        } catch (error) {
          console.error(`[API] Failed to fetch anime ${id} from Anilist:`, error);
        }
      }

      if (!anime) {
        set.status = 404;
        return "Anime not found";
      }
      return anime;
    },
    {
      params: t.Object({
        id: t.Numeric(),
      }),
      response: {
        200: AnimeModel,
        404: t.String(),
      },
      detail: {
        summary: "Get Anime by ID",
        description: "Retrieves a specific anime by its AniList ID.",
      },
    },
  );
