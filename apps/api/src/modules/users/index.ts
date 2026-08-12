import { Elysia, t, status } from "elysia";

import { activityDal, libraryDal, profileDal, reviewsDal, userDal } from "@tsuki/db";

import { authPlugin } from "../../plugins/auth";
import { ErrorModel } from "../../plugins/errors";
import type { MediaType } from "../media/model";
import { activityStartDate, currentActivityStreak, summarizeActivity } from "./activity";
import { ProfileModel, UpdateProfileModel, UserOverviewModel } from "./model";

const FAVORITES_LIMIT = 10;
const RECENT_LOGS_LIMIT = 10;
const RECENT_REVIEWS_LIMIT = 5;

/**
 * The database counts; the two judgement calls live here. Unscored entries sit
 * out of the mean rather than counting as zero, and a user with nothing scored
 * reads as 0 rather than null. A type with no entries has no row at all.
 */
function statsFor(rows: libraryDal.LibraryStatsRow[], type: MediaType) {
  const row = rows.find((entry) => entry.mediaType === type);
  if (!row) return { total: 0, progress: 0, meanScore: 0 };

  return {
    total: row.total,
    progress: row.progress,
    meanScore: row.scoredCount ? row.scoreSum / row.scoredCount : 0,
  };
}

export const userRoutes = new Elysia()
  .use(authPlugin)
  .get(
    "/users/:username",
    async ({ params: { username } }) => {
      const user = await userDal.getUserByUsername(username);
      if (!user) return status(404, { error: "User not found" });

      const today = new Date();
      const [stats, favorites, recentLogs, recentReviews, profile, activityRows, activityDates] =
        await Promise.all([
          libraryDal.getLibraryStats(user.id),
          libraryDal.getUserLibrary(user.id, { isFavorite: true, limit: FAVORITES_LIMIT }),
          libraryDal.getUserLibrary(user.id, { limit: RECENT_LOGS_LIMIT }),
          reviewsDal.getUserReviews(user.id, { limit: RECENT_REVIEWS_LIMIT }),
          profileDal.getProfileByUserId(user.id),
          activityDal.getProgressActivity(user.id, activityStartDate(today)),
          activityDal.getProgressActivityDates(user.id),
        ]);

      return {
        user: {
          id: user.id,
          name: user.name,
          username: user.username,
          displayUsername: user.displayUsername,
          image: user.image,
          createdAt: user.createdAt,
        },
        profile: profile ?? null,
        stats: {
          ANIME: statsFor(stats, "ANIME"),
          MANGA: statsFor(stats, "MANGA"),
        },
        favorites,
        recentLogs,
        recentReviews,
        activity: {
          ...summarizeActivity(activityRows, today),
          currentStreak: currentActivityStreak(
            activityDates.map(({ date }) => date),
            today,
          ),
        },
      };
    },
    {
      params: t.Object({ username: t.String() }),
      response: { 200: UserOverviewModel, 404: ErrorModel },
      detail: {
        summary: "Get a user's overview",
        description: "Public profile, per-type stats, favourites and recent activity.",
      },
    },
  )
  .put(
    "/me/profile",
    async ({ body, user }) => {
      const [profile] = await profileDal.updateUserProfile(user.id, body);
      if (!profile) return status(500, { error: "Failed to update profile" });

      return profile;
    },
    {
      auth: true,
      body: UpdateProfileModel,
      response: { 200: ProfileModel, 500: ErrorModel },
      detail: {
        summary: "Update my profile",
        description: "Updates the authenticated user's profile settings.",
      },
    },
  );
