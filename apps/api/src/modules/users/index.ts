import { Elysia, t, status as error } from "elysia";

import { libraryDal, reviewsDal, userDal, profileDal } from "@tsuki/db";

import { authPlugin } from "../../auth-plugin";

import {
  LibraryEntryModel,
  ReviewModel,
  LibraryEntryResponseModel,
  ReviewResponseModel,
  UserOverviewResponseModel,
  UserActivityResponseModel,
  UpdateProfileModel,
  MangaLibraryEntryModel,
  MangaLibraryEntryResponseModel,
  MangaReviewResponseModel,
  MangaUserActivityResponseModel,
} from "./model";

export const userRoutes = new Elysia({ prefix: "/users" })
  .use(authPlugin)
  // --- PUBLIC ROUTES (Read-only) ---
  .get(
    "/:username/library",
    async ({ params: { username } }) => {
      const user = await userDal.getUserByUsername(username);
      if (!user) return error(404, { success: false, error: "User not found" });
      return await libraryDal.getUserLibrary(user.id);
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
      return await reviewsDal.getUserReviews(user.id);
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
    "/:username/manga-library",
    async ({ params: { username } }) => {
      const user = await userDal.getUserByUsername(username);
      if (!user) return error(404, { success: false, error: "User not found" });
      return await libraryDal.getUserMangaLibrary(user.id);
    },
    {
      params: t.Object({ username: t.String() }),
      response: {
        200: t.Array(MangaLibraryEntryResponseModel),
        404: t.Object({ success: t.Boolean(), error: t.String() }),
      },
      detail: {
        summary: "Get User Manga Library",
        description: "Retrieves the manga library/read list for a specific user.",
      },
    },
  )
  .get(
    "/:username/manga-reviews",
    async ({ params: { username } }) => {
      const user = await userDal.getUserByUsername(username);
      if (!user) return error(404, { success: false, error: "User not found" });
      return await reviewsDal.getUserMangaReviews(user.id);
    },
    {
      params: t.Object({ username: t.String() }),
      response: {
        200: t.Array(MangaReviewResponseModel),
        404: t.Object({ success: t.Boolean(), error: t.String() }),
      },
      detail: {
        summary: "Get User Manga Reviews",
        description: "Retrieves all written manga reviews by a specific user.",
      },
    },
  )
  .get(
    "/:username/overview",
    async ({ params: { username } }) => {
      const user = await userDal.getUserByUsername(username);
      if (!user) return error(404, { success: false, error: "User not found" });

      const [library, reviews, profile, mangaLibrary, mangaReviews] = await Promise.all([
        libraryDal.getUserLibrary(user.id),
        reviewsDal.getUserReviews(user.id),
        profileDal.getProfileByUserId(user.id),
        libraryDal.getUserMangaLibrary(user.id),
        reviewsDal.getUserMangaReviews(user.id),
      ]);

      const favorites = library.filter((entry) => entry.isFavorite);
      const mangaFavorites = mangaLibrary.filter((entry) => entry.isFavorite);

      // Calculate mean score
      const ratedEntries = library.filter((e) => e.rating != null);
      const meanScore =
        ratedEntries.length > 0
          ? ratedEntries.reduce((sum, e) => sum + (e.rating || 0), 0) / ratedEntries.length
          : 0;

      const ratedMangaEntries = mangaLibrary.filter((e) => e.rating != null);
      const mangaMeanScore =
        ratedMangaEntries.length > 0
          ? ratedMangaEntries.reduce((sum, e) => sum + (e.rating || 0), 0) /
            ratedMangaEntries.length
          : 0;

      const episodesWatched = library.reduce((sum, e) => sum + e.episodesWatched, 0);
      const chaptersRead = mangaLibrary.reduce((sum, e) => sum + e.chaptersRead, 0);

      return {
        user: {
          id: user.id,
          name: user.name,
          username: user.username,
          displayUsername: user.displayUsername,
          image: user.image,
          createdAt: user.createdAt,
        },
        profile: profile || null,
        stats: {
          totalAnime: library.length,
          episodesWatched,
          meanScore,
          totalManga: mangaLibrary.length,
          chaptersRead,
          mangaMeanScore,
        },
        favorites: favorites.slice(0, 10),
        recentLogs: library.slice(0, 10),
        recentReviews: reviews.slice(0, 5),
        mangaFavorites: mangaFavorites.slice(0, 10),
        recentMangaLogs: mangaLibrary.slice(0, 10),
        recentMangaReviews: mangaReviews.slice(0, 5),
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
        libraryDal.getLibraryEntry(user.id, animeId),
        reviewsDal.getReviewForAnime(user.id, animeId),
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
  .get(
    "/me/manga-activity/:mangaId",
    async ({ params: { mangaId }, user }) => {
      const [entry, review] = await Promise.all([
        libraryDal.getMangaLibraryEntry(user.id, mangaId),
        reviewsDal.getReviewForManga(user.id, mangaId),
      ]);
      return {
        entry: entry || null,
        review: review || null,
      };
    },
    {
      auth: true,
      params: t.Object({ mangaId: t.Numeric() }),
      response: {
        200: MangaUserActivityResponseModel,
      },
      detail: { summary: "Get My Activity for Manga" },
    },
  )
  .post(
    "/me/library/:animeId",
    // TODO: requires the anime row to already exist (FK on user_anime_library.anime_id).
    // Holds today only because AnimeActions renders solely on /anime/[id], which warms
    // the row via GET /anime/:id. A quick-log entry point anywhere else (search results,
    // profile grid) breaks it — the insert then 500s. Fix: ensureAnimeExists(animeId)
    // here, reusing the read-through cache from modules/anime. Same for manga below.
    async ({ params: { animeId }, body, user }) => {
      const entry = await libraryDal.upsertLibraryEntry({
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
      await libraryDal.deleteLibraryEntry(user.id, animeId);
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
    "/me/manga-library/:mangaId",
    // TODO: same missing precondition as POST /me/library/:animeId above — needs
    // ensureMangaExists(mangaId) before the upsert.
    async ({ params: { mangaId }, body, user }) => {
      const entry = await libraryDal.upsertMangaLibraryEntry({
        userId: user.id,
        mangaId: mangaId,
        ...body,
      });
      if (!entry) return error(500, "Failed to create entry");
      return { success: true, entry };
    },
    {
      auth: true,
      body: MangaLibraryEntryModel,
      params: t.Object({ mangaId: t.Numeric() }),
      response: {
        200: t.Object({ success: t.Boolean(), entry: MangaLibraryEntryResponseModel }),
        500: t.String(),
      },
      detail: { summary: "Log Manga" },
    },
  )
  .delete(
    "/me/manga-library/:mangaId",
    async ({ params: { mangaId }, user }) => {
      await libraryDal.deleteMangaLibraryEntry(user.id, mangaId);
      return { success: true };
    },
    {
      auth: true,
      params: t.Object({ mangaId: t.Numeric() }),
      response: t.Object({ success: t.Boolean() }),
      detail: { summary: "Delete Manga Library Entry" },
    },
  )

  .post(
    "/me/reviews/:animeId",
    // TODO: same missing precondition as POST /me/library/:animeId (FK on user_reviews.anime_id).
    async ({ params: { animeId }, body, user }) => {
      const existing = await reviewsDal.getReviewForAnime(user.id, animeId);

      if (existing) {
        const review = await reviewsDal.updateReview(existing.id, {
          content: body.content,
          containsSpoilers: body.containsSpoilers,
        });
        if (!review) return error(500, "Failed to update review");
        return { success: true, review };
      } else {
        const review = await reviewsDal.createReview({
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
  )
  .post(
    "/me/manga-reviews/:mangaId",
    // TODO: same missing precondition as POST /me/library/:animeId (FK on user_manga_reviews.manga_id).
    async ({ params: { mangaId }, body, user }) => {
      const existing = await reviewsDal.getReviewForManga(user.id, mangaId);

      if (existing) {
        const review = await reviewsDal.updateMangaReview(existing.id, {
          content: body.content,
          containsSpoilers: body.containsSpoilers,
        });
        if (!review) return error(500, "Failed to update review");
        return { success: true, review };
      } else {
        const review = await reviewsDal.createMangaReview({
          id: crypto.randomUUID(),
          userId: user.id,
          mangaId: mangaId,
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
      params: t.Object({ mangaId: t.Numeric() }),
      response: {
        200: t.Object({ success: t.Boolean(), review: MangaReviewResponseModel }),
        500: t.String(),
      },
      detail: { summary: "Submit Manga Review" },
    },
  )
  .put(
    "/me/profile",
    async ({ body, user }) => {
      const updatedProfile = await profileDal.updateUserProfile(user.id, body);
      return { success: true, profile: updatedProfile[0] };
    },
    {
      auth: true,
      body: UpdateProfileModel,
      detail: {
        summary: "Update User Profile",
        description: "Updates the authenticated user's profile settings.",
      },
    },
  );
