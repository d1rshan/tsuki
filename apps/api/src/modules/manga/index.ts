import { Elysia, t, status as error } from "elysia";
import { mangaDal } from "@tsuki/db";
import { fetchTrendingManga, fetchMangaById } from "@tsuki/anilist";

import { MangaModel, MangaCompactModel } from "./model";

export const mangaRoutes = new Elysia({ prefix: "/manga" })
  .get(
    "/trending",
    async () => {
      const data = await fetchTrendingManga();
      return data;
    },
    {
      response: t.Array(MangaCompactModel),
      detail: {
        summary: "Get Trending Manga",
        description: "Retrieves the daily trending manga directly from AniList.",
      },
    },
  )
  .get(
    "/search",
    async ({ query }) => {
      const q = query.q;
      return await mangaDal.searchManga(q);
    },
    {
      query: t.Object({
        q: t.String({ description: "Search query string" }),
      }),
      response: t.Array(MangaCompactModel),
      detail: {
        summary: "Search Manga",
        description: "Searches for manga in the database matching the query.",
      },
    },
  )
  .get(
    "/:id",
    async ({ params: { id } }) => {
      let manga = await mangaDal.getMangaById(id);

      // Read-through cache: if not in DB, fetch from Anilist, save to DB, then return
      if (!manga) {
        try {
          const fetchedManga = await fetchMangaById(id);

          if (fetchedManga) {
            await mangaDal.upsertMangas([fetchedManga]);
            manga = await mangaDal.getMangaById(id);
          }
        } catch (error) {
          console.error(`[API] Failed to fetch manga ${id} from Anilist:`, error);
        }
      }

      if (!manga) {
        return error(404, "Manga not found");
      }
      return manga;
    },
    {
      params: t.Object({
        id: t.Numeric(),
      }),
      response: {
        200: MangaModel,
        404: t.String(),
      },
      detail: {
        summary: "Get Manga by ID",
        description: "Retrieves a specific manga by its AniList ID.",
      },
    },
  );
