import { Elysia, t, status } from "elysia";

import { anilistMediaById, anilistTrendingMedia } from "@tsuki/anilist";
import { mediaDal } from "@tsuki/db";

import { ErrorModel } from "../../plugins/errors";
import { MediaCompactModel, MediaModel, MediaTypeEnum, type MediaType } from "./model";

/**
 * Read-through cache: serve from our table, else pull from AniList and persist.
 * Null only when AniList has no such media of that type.
 */
export async function getMedia(type: MediaType, id: number) {
  const cached = await mediaDal.getMediaById(type, id);
  if (cached) return cached;

  const fetched = await anilistMediaById(type, id);
  if (!fetched) return null;

  await mediaDal.upsertMedia([fetched]);
  return mediaDal.getMediaById(type, id);
}

/** Library entries and reviews carry a foreign key to media, so the row has to exist first. */
export async function ensureMediaExists(type: MediaType, id: number) {
  return (await getMedia(type, id)) != null;
}

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
      const media = await getMedia(type, id);
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
