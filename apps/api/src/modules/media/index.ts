import { Elysia, t, status } from "elysia";

import { ErrorModel } from "../../plugins/errors";
import { MediaCompactModel, MediaModel, MediaTypeParam, toDbMediaType } from "./model";
import * as mediaService from "./service";

export const mediaRoutes = new Elysia({ prefix: "/media" })
  .get("/:type/trending", ({ params: { type } }) => mediaService.getTrending(toDbMediaType(type)), {
    params: t.Object({ type: MediaTypeParam }),
    response: { 200: t.Array(MediaCompactModel) },
    detail: {
      summary: "Get trending media",
      description: "Current trending anime or manga, read live from AniList.",
    },
  })
  .get(
    "/:type/:id",
    async ({ params: { type, id } }) => {
      const media = await mediaService.getMedia(toDbMediaType(type), id);
      if (!media) return status(404, { error: "Media not found" });

      return mediaService.toMedia(media);
    },
    {
      params: t.Object({ type: MediaTypeParam, id: t.Numeric() }),
      response: { 200: MediaModel, 404: ErrorModel },
      detail: {
        summary: "Get media by id",
        description: "Serves from cache, falling back to AniList and persisting the result.",
      },
    },
  );
