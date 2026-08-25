import { Elysia, t, status } from "elysia";

import { profileDal, socialDal } from "@tsuki/db";

import { authPlugin } from "../../plugins/auth";
import { ErrorModel } from "../../plugins/errors";
import {
  buildUserOverview,
  followProfile,
  getActivityFeed,
  requireUser,
  unfollowProfile,
} from "./service";
import {
  FeedModel,
  FeedQueryModel,
  FollowListModel,
  FollowListQueryModel,
  FollowRelationshipModel,
  ProfileModel,
  UpdateProfileModel,
  UserDiscoveryModel,
  UserDiscoveryQueryModel,
  UserOverviewModel,
} from "./model";

/** Popular on Tsuki: the default Friends list size. */
const DISCOVERY_LIMIT = 24;

export const userRoutes = new Elysia()
  .use(authPlugin)
  .get(
    "/users/discover",
    async ({ query, user }) => ({
      users: await socialDal.getUserDiscovery(user.id, {
        limit: DISCOVERY_LIMIT,
        usernamePrefix: query.username,
      }),
    }),
    {
      auth: true,
      query: UserDiscoveryQueryModel,
      response: { 200: UserDiscoveryModel },
      detail: {
        summary: "Discover users",
        description: "Popular users or Username-prefix matches, excluding the viewer.",
      },
    },
  )
  .get("/me/activity", ({ query, user }) => getActivityFeed(user.id, query.type, query), {
    auth: true,
    query: FeedQueryModel,
    response: { 200: FeedModel },
    detail: {
      summary: "Get the Activity Feed",
      description: "Newest-first Activity for Following or Public.",
    },
  })
  .get(
    "/users/:username",
    async ({ params: { username }, viewer }) => {
      const user = await requireUser(username);
      return buildUserOverview(user, viewer);
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
      const user = await requireUser(username);

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
      const user = await requireUser(username);

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
      const profileUser = await requireUser(username);
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
      const profileUser = await requireUser(username);
      return followProfile(user.id, profileUser.id);
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
      const profileUser = await requireUser(username);
      return unfollowProfile(user.id, profileUser.id);
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
