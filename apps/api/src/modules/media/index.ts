import { Elysia, t, status } from "elysia";

import { mediaDal } from "@tsuki/db";

import { ErrorModel } from "../../plugins/errors";
import { ensureMedia } from "./service";
import { MediaCompactModel, MediaModel, MediaTypeEnum } from "./model";

const TRENDING_LIMIT = 70;
const SEARCH_LIMIT_DEFAULT = 24;
const SEARCH_LIMIT_MAX = 50;

export const mediaRoutes = new Elysia({ prefix: "/media", tags: ["Media"] })
  .get(
    // Static segment before /:type/:id so Elysia never routes "search" as an id.
    "/:type/search",
    async ({ params: { type }, query: { q, limit, nsfw } }) => {
      const term = (q ?? "").trim();
      // One character matches half the catalogue; treat it as no query.
      if (term.length < 2) return [];

      return mediaDal.searchMedia(type, term, {
        limit: Math.min(limit ?? SEARCH_LIMIT_DEFAULT, SEARCH_LIMIT_MAX),
        includeNsfw: nsfw === true,
      });
    },
    {
      params: t.Object({ type: MediaTypeEnum }),
      query: t.Object({
        q: t.Optional(t.String()),
        limit: t.Optional(t.Numeric()),
        nsfw: t.Optional(t.Boolean()),
      }),
      response: { 200: t.Array(MediaCompactModel) },
      detail: {
        summary: "Search media",
        description:
          "Server-side trigram search over our catalogue (ADR 0004). Queries under two characters return an empty list.",
      },
    },
  )
  .get(
    "/:type/trending",
    async ({ params: { type } }) => {
      return mediaDal.listTrending(type, TRENDING_LIMIT);
    },
    {
      params: t.Object({ type: MediaTypeEnum }),
      response: { 200: t.Array(MediaCompactModel) },
      detail: {
        summary: "Get trending media",
        description: "Top non-NSFW titles ranked by popularity in our own catalogue (ADR 0004).",
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
        description: "Serves from our catalogue; 404 until the crawl has the title.",
      },
    },
  );
