import { Elysia, t, status } from "elysia";

import { profileDal, userDal } from "@tsuki/db";

import { authPlugin } from "../../plugins/auth";
import { ErrorModel } from "../../plugins/errors";
import { ProfileModel, UpdateProfileModel, UserOverviewModel } from "./model";
import * as usersService from "./service";

export const userRoutes = new Elysia()
  .use(authPlugin)
  .get(
    "/users/:username",
    async ({ params: { username } }) => {
      const user = await userDal.getUserByUsername(username);
      if (!user) return status(404, { error: "User not found" });

      return usersService.buildOverview(user);
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

      return usersService.toProfile(profile);
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
