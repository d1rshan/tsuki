import { Elysia, t } from "elysia";

import { reviewsDal } from "@tsuki/db";

import { authPlugin } from "../../plugins/auth";
import { ErrorModel } from "../../plugins/errors";
import { MediaTypeEnum } from "../media/model";
import { requireUser } from "../profiles/service";
import { ReviewInputModel, ReviewModel, ReviewQueryModel } from "./model";
import { removeReview, submitReview } from "./service";

export const reviewRoutes = new Elysia()
  .use(authPlugin)
  .get(
    "/users/:username/reviews",
    async ({ params: { username }, query }) => {
      const user = await requireUser(username);
      return reviewsDal.getUserReviews(user.id, query);
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
    ({ params: { type, id }, body, user }) => submitReview(user.id, type, id, body),
    {
      auth: true,
      params: t.Object({ type: MediaTypeEnum, id: t.Numeric() }),
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
      await removeReview(user.id, id);
      set.status = 204;
    },
    {
      auth: true,
      params: t.Object({ type: MediaTypeEnum, id: t.Numeric() }),
      detail: { summary: "Delete a review" },
    },
  );
