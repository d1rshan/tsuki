import { Elysia } from "elysia";
import { AnilistService } from "./service";

const anilist = new AnilistService();

export const animeRoutes = new Elysia({ prefix: "/anime" })
  .get("/trending", async () => {
    const anime = await anilist.getTrending();
    return anime;
  });
