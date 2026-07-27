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
  // TODO: no consumer yet — the web app searches AniList directly from the
  // browser (see modules/media/hooks/use-media-search). This only matches media
  // already cached locally, so it returns fewer results than that path. Not dead
  // code; kept as the server-side search entry point. Decide later whether this
  // should fall through to AniList like /:type/:id does, and whether the client
  // should route through it so searches warm the cache.
  .get(
    "/:type/search",
    ({ params: { type }, query }) => mediaService.search(toDbMediaType(type), query.q),
    {
      params: t.Object({ type: MediaTypeParam }),
      query: t.Object({ q: t.String({ description: "Search query" }) }),
      response: { 200: t.Array(MediaCompactModel) },
      detail: {
        summary: "Search media",
        description: "Searches locally cached media of the given type.",
      },
    },
  )
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
