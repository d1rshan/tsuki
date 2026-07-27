import { Elysia, t, status } from "elysia";

import { reviewsDal, userDal } from "@tsuki/db";

import { authPlugin } from "../../plugins/auth";
import { ErrorModel } from "../../plugins/errors";
import { MediaTypeParam, toDbMediaType } from "../media/model";
import { ensureMediaExists } from "../media/service";
import { ReviewInputModel, ReviewModel, ReviewQueryModel } from "./model";
import * as reviewsService from "./service";

export const reviewRoutes = new Elysia()
  .use(authPlugin)
  .get(
    "/users/:username/reviews",
    async ({ params: { username }, query }) => {
      const user = await userDal.getUserByUsername(username);
      if (!user) return status(404, { error: "User not found" });

      return reviewsService.getUserReviews(user.id, {
        type: query.type && toDbMediaType(query.type),
        limit: query.limit,
        offset: query.offset,
      });
    },
    {
      params: t.Object({ username: t.String() }),
      query: ReviewQueryModel,
      response: { 200: t.Array(ReviewModel), 404: ErrorModel },
      detail: {
        summary: "Get a user's reviews",
        description: "Omit `type` to get anime and manga reviews together, newest first.",
      },
    },
  )
  .put(
    "/me/reviews/:type/:id",
    async ({ params: { type, id }, body, user }) => {
      const mediaType = toDbMediaType(type);

      if (!(await ensureMediaExists(mediaType, id))) {
        return status(404, { error: "Media not found" });
      }

      await reviewsDal.upsertReview({
        id: crypto.randomUUID(),
        userId: user.id,
        mediaId: id,
        mediaType,
        content: body.content,
        containsSpoilers: body.containsSpoilers ?? false,
      });

      const review = await reviewsService.getReview(user.id, id);
      if (!review) return status(500, { error: "Failed to save review" });

      return review;
    },
    {
      auth: true,
      params: t.Object({ type: MediaTypeParam, id: t.Numeric() }),
      body: ReviewInputModel,
      response: { 200: ReviewModel, 404: ErrorModel, 500: ErrorModel },
      detail: {
        summary: "Submit a review",
        description: "Creates or replaces the current user's review for this title.",
      },
    },
  )
  .delete(
    "/me/reviews/:type/:id",
    async ({ params: { id }, user, set }) => {
      await reviewsDal.deleteReview(user.id, id);
      set.status = 204;
    },
    {
      auth: true,
      params: t.Object({ type: MediaTypeParam, id: t.Numeric() }),
      detail: { summary: "Delete a review" },
    },
  );
