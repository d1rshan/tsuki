import { Elysia, t, status } from "elysia";

import { profileDal } from "@tsuki/db";
import type { RichContent } from "@tsuki/rich-content";
import { isEmptyRichContent, validateRichContent } from "@tsuki/rich-content";

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
      // The editor is not a security boundary: the API owns Rich Content policy.
      const { bio: rawBio, ...settings } = body;
      let bio: RichContent | null | undefined;
      if (rawBio !== undefined) {
        const parsed = validateRichContent(rawBio, "bio");
        if (!parsed.ok) return status(422, { error: parsed.reason });
        // An empty bio stores as null, keeping one representation of "none".
        bio = isEmptyRichContent(parsed.value) ? null : parsed.value;
      }

      const [profile] = await profileDal.updateUserProfile(user.id, {
        ...settings,
        ...(rawBio !== undefined && { bio }),
      });
      if (!profile) return status(500, { error: "Failed to update profile" });

      return profile;
    },
    {
      auth: true,
      body: UpdateProfileModel,
      response: { 200: ProfileModel, 422: ErrorModel, 500: ErrorModel },
      detail: {
        summary: "Update my profile",
        description:
          "Updates the authenticated user's profile settings. Bio must be a valid Rich Content document for the bio preset.",
      },
    },
  );
