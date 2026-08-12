import { Elysia, t, status } from "elysia";

import { libraryDal, profileDal, reviewsDal, socialDal, userDal } from "@tsuki/db";

import { authPlugin } from "../../plugins/auth";
import { ErrorModel } from "../../plugins/errors";
import type { MediaType } from "../media/model";
import {
  FollowListModel,
  FollowListQueryModel,
  FollowRelationshipModel,
  ProfileModel,
  UpdateProfileModel,
  UserOverviewModel,
} from "./model";

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
    async ({ params: { username }, viewer }) => {
      const user = await userDal.getUserByUsername(username);
      if (!user) return status(404, { error: "User not found" });

      const [stats, favorites, recentLogs, recentReviews, profile, counts, relationship] =
        await Promise.all([
          libraryDal.getLibraryStats(user.id),
          libraryDal.getUserLibrary(user.id, { isFavorite: true, limit: FAVORITES_LIMIT }),
          libraryDal.getUserLibrary(user.id, { limit: RECENT_LOGS_LIMIT }),
          reviewsDal.getUserReviews(user.id, { limit: RECENT_REVIEWS_LIMIT }),
          profileDal.getProfileByUserId(user.id),
          socialDal.getFollowCounts(user.id),
          viewer && viewer.id !== user.id
            ? socialDal.getFollowRelationship(viewer.id, user.id)
            : null,
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
        social: { ...counts, viewer: relationship },
      };
    },
    {
      optionalAuth: true,
      params: t.Object({ username: t.String() }),
      response: { 200: UserOverviewModel, 404: ErrorModel },
      detail: {
        summary: "Get a user's overview",
        description: "Public profile, per-type stats, favourites and recent activity.",
      },
    },
  )
  .get(
    "/users/:username/followers",
    async ({ params: { username }, query }) => {
      const user = await userDal.getUserByUsername(username);
      if (!user) return status(404, { error: "User not found" });

      const options = { limit: query.limit ?? 40, offset: query.offset ?? 0 };
      const [users, total] = await Promise.all([
        socialDal.getFollowers(user.id, options),
        socialDal.getFollowerCount(user.id),
      ]);

      return { users, total };
    },
    {
      params: t.Object({ username: t.String() }),
      query: FollowListQueryModel,
      response: { 200: FollowListModel, 404: ErrorModel },
      detail: { summary: "List a user's followers" },
    },
  )
  .get(
    "/users/:username/following",
    async ({ params: { username }, query }) => {
      const user = await userDal.getUserByUsername(username);
      if (!user) return status(404, { error: "User not found" });

      const options = { limit: query.limit ?? 40, offset: query.offset ?? 0 };
      const [users, total] = await Promise.all([
        socialDal.getFollowing(user.id, options),
        socialDal.getFollowingCount(user.id),
      ]);

      return { users, total };
    },
    {
      params: t.Object({ username: t.String() }),
      query: FollowListQueryModel,
      response: { 200: FollowListModel, 404: ErrorModel },
      detail: { summary: "List users followed by a user" },
    },
  )
  .get(
    "/users/:username/relationship",
    async ({ params: { username }, user }) => {
      const profileUser = await userDal.getUserByUsername(username);
      if (!profileUser) return status(404, { error: "User not found" });
      if (profileUser.id === user.id) {
        return { following: false, followedBy: false };
      }

      return socialDal.getFollowRelationship(user.id, profileUser.id);
    },
    {
      auth: true,
      params: t.Object({ username: t.String() }),
      response: { 200: FollowRelationshipModel, 404: ErrorModel },
      detail: { summary: "Get my relationship to a user" },
    },
  )
  .post(
    "/users/:username/follow",
    async ({ params: { username }, user }) => {
      const profileUser = await userDal.getUserByUsername(username);
      if (!profileUser) return status(404, { error: "User not found" });
      if (profileUser.id === user.id) {
        return status(400, { error: "You cannot follow yourself" });
      }

      await socialDal.followUser(user.id, profileUser.id);
      return socialDal.getFollowRelationship(user.id, profileUser.id);
    },
    {
      auth: true,
      params: t.Object({ username: t.String() }),
      response: { 200: FollowRelationshipModel, 400: ErrorModel, 404: ErrorModel },
      detail: { summary: "Follow a user" },
    },
  )
  .delete(
    "/users/:username/follow",
    async ({ params: { username }, user }) => {
      const profileUser = await userDal.getUserByUsername(username);
      if (!profileUser) return status(404, { error: "User not found" });
      if (profileUser.id === user.id) {
        return status(400, { error: "You cannot follow yourself" });
      }

      await socialDal.unfollowUser(user.id, profileUser.id);
      return socialDal.getFollowRelationship(user.id, profileUser.id);
    },
    {
      auth: true,
      params: t.Object({ username: t.String() }),
      response: { 200: FollowRelationshipModel, 400: ErrorModel, 404: ErrorModel },
      detail: { summary: "Unfollow a user" },
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
