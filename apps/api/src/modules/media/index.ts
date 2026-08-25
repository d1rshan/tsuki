import { Elysia, t, status } from "elysia";

import { anilistTrendingMedia } from "@tsuki/anilist";
import { mediaDal } from "@tsuki/db";

import { ErrorModel } from "../../plugins/errors";
import { ensureMedia } from "./service";
import { MediaCompactModel, MediaModel, MediaTypeEnum } from "./model";

export const mediaRoutes = new Elysia({ prefix: "/media" })
  .get(
    "/:type/trending",
    async ({ params: { type } }) => {
      // Read live, not through the cache: AniList's trending is a rolling count
      // of the past hour, so stored copies aren't comparable across syncs. Rows
      // are still persisted so opening a title from the carousel is a local hit.
      const rows = await anilistTrendingMedia(type);
      await mediaDal.upsertMedia(rows);

      return rows;
    },
    {
      params: t.Object({ type: MediaTypeEnum }),
      response: { 200: t.Array(MediaCompactModel) },
      detail: {
        summary: "Get trending media",
        description: "Current trending anime or manga, read live from AniList.",
      },
    },
  )
  .get(
    "/:type/:id",
    async ({ params: { type, id } }) => {
      const media = await ensureMedia(type, id);
      if (!media) return status(404, { error: "Media not found" });

      return media;
    },
    {
      params: t.Object({ type: MediaTypeEnum, id: t.Numeric() }),
      response: { 200: MediaModel, 404: ErrorModel },
      detail: {
        summary: "Get media by id",
        description: "Serves from cache, falling back to AniList and persisting the result.",
      },
    },
  );
