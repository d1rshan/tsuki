import { Elysia, t, status } from "elysia";

import { libraryDal, profileDal, reviewsDal, userDal } from "@tsuki/db";

import { authPlugin } from "../../plugins/auth";
import { ErrorModel } from "../../plugins/errors";
import type { ApiMediaType } from "../media/model";
import { ProfileModel, UpdateProfileModel, UserOverviewModel } from "./model";

type LibraryRow = Awaited<ReturnType<typeof libraryDal.getUserLibrary>>[number];

const FAVORITES_LIMIT = 10;
const RECENT_LOGS_LIMIT = 10;
const RECENT_REVIEWS_LIMIT = 5;

function statsFor(entries: LibraryRow[], type: ApiMediaType) {
  const forType = entries.filter((entry) => entry.mediaType === type);
  const scored = forType.filter((entry) => entry.score != null);

  return {
    total: forType.length,
    progress: forType.reduce((sum, entry) => sum + entry.progress, 0),
    meanScore: scored.length
      ? scored.reduce((sum, entry) => sum + entry.score!, 0) / scored.length
      : 0,
  };
}

export const userRoutes = new Elysia()
  .use(authPlugin)
  .get(
    "/users/:username",
    async ({ params: { username } }) => {
      const user = await userDal.getUserByUsername(username);
      if (!user) return status(404, { error: "User not found" });

      // The whole library is needed for accurate totals; the lists are slices of it.
      const [entryRows, reviewRows, profile] = await Promise.all([
        libraryDal.getUserLibrary(user.id, {}),
        reviewsDal.getUserReviews(user.id, { limit: RECENT_REVIEWS_LIMIT }),
        profileDal.getProfileByUserId(user.id),
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
          ANIME: statsFor(entryRows, "ANIME"),
          MANGA: statsFor(entryRows, "MANGA"),
        },
        favorites: entryRows.filter((entry) => entry.isFavorite).slice(0, FAVORITES_LIMIT),
        recentLogs: entryRows.slice(0, RECENT_LOGS_LIMIT),
        recentReviews: reviewRows,
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
