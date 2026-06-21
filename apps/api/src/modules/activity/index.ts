import { Elysia, t, status as error } from "elysia";
import { activityDal, userDal } from "@tsuki/db";

import { authPlugin } from "../../auth-plugin";

import {
  LibraryEntryModel,
  ReviewModel,
  LibraryEntryResponseModel,
  ReviewResponseModel,
  UserOverviewResponseModel,
  UserActivityResponseModel,
} from "./model";

export const activityRoutes = new Elysia({ prefix: "/users" })
  .use(authPlugin)
  // --- PUBLIC ROUTES (Read-only) ---
  .get(
    "/:username/library",
    async ({ params: { username } }) => {
      const user = await userDal.getUserByUsername(username);
      if (!user) return error(404, { success: false, error: "User not found" });
      return await activityDal.getUserLibrary(user.id);
    },
    {
      params: t.Object({ username: t.String() }),
      response: {
        200: t.Array(LibraryEntryResponseModel),
        404: t.Object({ success: t.Boolean(), error: t.String() }),
      },
      detail: {
        summary: "Get User Library",
        description: "Retrieves the anime library/watch list for a specific user.",
      },
    },
  )
  .get(
    "/:username/reviews",
    async ({ params: { username } }) => {
      const user = await userDal.getUserByUsername(username);
      if (!user) return error(404, { success: false, error: "User not found" });
      return await activityDal.getUserReviews(user.id);
    },
    {
      params: t.Object({ username: t.String() }),
      response: {
        200: t.Array(ReviewResponseModel),
        404: t.Object({ success: t.Boolean(), error: t.String() }),
      },
      detail: {
        summary: "Get User Reviews",
        description: "Retrieves all written reviews by a specific user.",
      },
    },
  )
  .get(
    "/:username/overview",
    async ({ params: { username } }) => {
      const user = await userDal.getUserByUsername(username);
      if (!user) return error(404, { success: false, error: "User not found" });

      const [library, reviews] = await Promise.all([
        activityDal.getUserLibrary(user.id),
        activityDal.getUserReviews(user.id),
      ]);

      const favorites = library.filter((entry) => entry.isFavorite);

      // Calculate mean score
      const ratedEntries = library.filter((e) => e.rating != null);
      const meanScore =
        ratedEntries.length > 0
          ? ratedEntries.reduce((sum, e) => sum + (e.rating || 0), 0) / ratedEntries.length
          : 0;

      const episodesWatched = library.reduce((sum, e) => sum + e.episodesWatched, 0);

      return {
        user: {
          id: user.id,
          name: user.name,
          username: user.username,
          displayUsername: user.displayUsername,
          image: user.image,
          createdAt: user.createdAt,
        },
        stats: {
          totalAnime: library.length,
          episodesWatched,
          meanScore,
        },
        favorites: favorites.slice(0, 10),
        recentLogs: library.slice(0, 10),
        recentReviews: reviews.slice(0, 5),
      };
    },
    {
      params: t.Object({ username: t.String() }),
      response: {
        200: UserOverviewResponseModel,
        404: t.Object({ success: t.Boolean(), error: t.String() }),
      },
      detail: {
        summary: "Get User Overview",
        description: "Retrieves a high-level overview of a user's profile and stats.",
      },
    },
  )
  // --- PROTECTED ROUTES (Mutations) ---

  .get(
    "/me/activity/:animeId",
    async ({ params: { animeId }, user }) => {
      const [entry, review] = await Promise.all([
        activityDal.getLibraryEntry(user.id, animeId),
        activityDal.getReviewForAnime(user.id, animeId),
      ]);
      return {
        entry: entry || null,
        review: review || null,
      };
    },
    {
      auth: true,
      params: t.Object({ animeId: t.Numeric() }),
      response: {
        200: UserActivityResponseModel,
      },
      detail: { summary: "Get My Activity for Anime" },
    },
  )
  .post(
    "/me/library/:animeId",
    async ({ params: { animeId }, body, user }) => {
      const entry = await activityDal.upsertLibraryEntry({
        userId: user.id,
        animeId: animeId,
        ...body,
      });
      if (!entry) return error(500, "Failed to create entry");
      return { success: true, entry };
    },
    {
      auth: true,
      body: LibraryEntryModel,
      params: t.Object({ animeId: t.Numeric() }),
      response: {
        200: t.Object({ success: t.Boolean(), entry: LibraryEntryResponseModel }),
        500: t.String(),
      },
      detail: { summary: "Log Anime" },
    },
  )
  .delete(
    "/me/library/:animeId",
    async ({ params: { animeId }, user }) => {
      await activityDal.deleteLibraryEntry(user.id, animeId);
      return { success: true };
    },
    {
      auth: true,
      params: t.Object({ animeId: t.Numeric() }),
      response: t.Object({ success: t.Boolean() }),
      detail: { summary: "Delete Library Entry" },
    },
  )

  .post(
    "/me/reviews/:animeId",
    async ({ params: { animeId }, body, user }) => {
      const existing = await activityDal.getReviewForAnime(user.id, animeId);

      if (existing) {
        const review = await activityDal.updateReview(existing.id, {
          content: body.content,
          containsSpoilers: body.containsSpoilers,
        });
        if (!review) return error(500, "Failed to update review");
        return { success: true, review };
      } else {
        const review = await activityDal.createReview({
          id: crypto.randomUUID(),
          userId: user.id,
          animeId: animeId,
          content: body.content,
          containsSpoilers: body.containsSpoilers || false,
        });
        if (!review) return error(500, "Failed to create review");
        return { success: true, review };
      }
    },
    {
      auth: true,
      body: ReviewModel,
      params: t.Object({ animeId: t.Numeric() }),
      response: {
        200: t.Object({ success: t.Boolean(), review: ReviewResponseModel }),
        500: t.String(),
      },
      detail: { summary: "Submit Review" },
    },
  );
