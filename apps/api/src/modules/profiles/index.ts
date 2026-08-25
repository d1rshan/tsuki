import { Elysia, t, status } from "elysia";

import { profileDal } from "@tsuki/db";

import { authPlugin } from "../../plugins/auth";
import { ErrorModel } from "../../plugins/errors";
import { buildUserOverview, requireUser } from "./service";
import { ProfileModel, UpdateProfileModel, UserOverviewModel } from "./model";

// TODO: Rename `/users/:username` routes to `/profiles/:username` (and
// `/users/discover`, follower lists etc. in the social module) once the web
// app's Eden clients are updated alongside. Routes kept as-is for now to
// avoid a breaking change.

export const profilesRoutes = new Elysia({ tags: ["Profiles"] })
  .use(authPlugin)
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
