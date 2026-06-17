import { Elysia, t } from "elysia";
import { animeDal } from "@tsuki/db";
import { AnimeModel, AnimeCompactModel } from "./model";
import { fetchTrendingAnime, fetchAnimeById } from "@tsuki/anilist";

export async function syncTrendingAnime() {
  console.log("[Sync] Fetching trending anime...");
  try {
    const animesData = await fetchTrendingAnime();

    if (animesData.length === 0) return { success: true, count: 0 };

    // Upsert anime into main table
    await animeDal.upsertAnimes(animesData);

    // Update trending list
    const animeIds = animesData.map((anime) => anime.id);
    await animeDal.setTrendingAnime(animeIds);

    console.log(`[Sync] Successfully updated ${animesData.length} trending anime.`);
    return { success: true, count: animesData.length };
  } catch (error) {
    console.error("[Sync] Failed to update trending anime:", error);
    throw error;
  }
}

export const animeRoutes = new Elysia({ prefix: "/anime" })
  .get(
    "/sync-trending",
    async ({ headers, set }) => {
      // Vercel Cron will send the Authorization header with Bearer CRON_SECRET
      const authHeader = headers.authorization;

      if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        set.status = 401;
        return { success: false, error: "Unauthorized" };
      }

      await syncTrendingAnime();
      return { success: true };
    },
    {
      detail: {
        summary: "Sync Trending Anime",
        description: "Vercel Cron endpoint to fetch and update trending anime from AniList.",
      },
    },
  )
  .get(
    "/trending",
    async () => {
      return await animeDal.getTrendingAnime();
    },
    {
      response: t.Array(AnimeCompactModel),
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
      response: t.Array(AnimeCompactModel),
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
          const fetchedAnime = await fetchAnimeById(id);

          if (fetchedAnime) {
            await animeDal.upsertAnimes([fetchedAnime]);
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
