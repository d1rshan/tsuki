import { Elysia, t } from "elysia";

import { socialDal } from "@tsuki/db";

import { authPlugin } from "../../plugins/auth";
import { ErrorModel } from "../../plugins/errors";
import { requireUser } from "../profiles/service";
import {
  FollowListModel,
  FollowListQueryModel,
  FollowRelationshipModel,
  UserDiscoveryModel,
  UserDiscoveryQueryModel,
} from "./model";
import { followProfile, unfollowProfile } from "./service";

/** The bounded Discover section above the Following feed. */
const DISCOVERY_LIMIT = 12;

export const socialRoutes = new Elysia({ tags: ["Social"] })
  .use(authPlugin)
  .get(
    "/users/discover",
    async ({ query, viewer }) => ({
      users: await socialDal.getUserDiscovery(viewer?.id ?? null, {
        limit: DISCOVERY_LIMIT,
        usernamePrefix: query.username,
      }),
    }),
    {
      optionalAuth: true,
      query: UserDiscoveryQueryModel,
      response: { 200: UserDiscoveryModel },
      detail: {
        summary: "Discover users",
        description: "Popular users or Username-prefix matches. Public; excludes the viewer.",
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
  );
