import { Elysia, t, status as error } from "elysia";
import { animeDal } from "@tsuki/db";
import { fetchTrendingAnime, fetchAnimeById } from "@tsuki/anilist";

import { AnimeModel, AnimeCompactModel } from "./model";

export const animeRoutes = new Elysia({ prefix: "/anime" })
  .get(
    "/trending",
    async () => {
      const data = await fetchTrendingAnime();
      return data;
    },
    {
      response: t.Array(AnimeCompactModel),
      detail: {
        summary: "Get Trending Anime",
        description: "Retrieves the daily trending anime directly from AniList.",
      },
    },
  )
  .get(
    "/search",
    async ({ query }) => {
      const q = query.q;
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
    async ({ params: { id } }) => {
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
        return error(404, "Anime not found");
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
