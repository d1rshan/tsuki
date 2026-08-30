import { Elysia, t, status } from "elysia";

import { profileDal, userDal } from "@tsuki/db";
import type { RichContent } from "@tsuki/rich-content";
import { isEmptyRichContent, validateRichContent } from "@tsuki/rich-content";

import { authPlugin } from "../../plugins/auth";
import { ErrorModel } from "../../plugins/errors";
import { generateImageKitUploadAuth, isImageKitConfigured, parseImagePath } from "./imagekit";
import { buildUserOverview, requireUser } from "./service";
import { ProfileModel, UpdateProfileModel, UploadAuthModel, UserOverviewModel } from "./model";

// TODO: Rename `/users/:username` routes to `/profiles/:username` (and
// `/users/discover`, follower lists etc. in the social module) once the web
// app's Eden clients are updated alongside. Routes kept as-is for now to
// avoid a breaking change.

export const profilesRoutes = new Elysia({ tags: ["Profiles"] })
  .use(authPlugin)
  .get(
    "/me/profile/upload-auth",
    ({ user }) => {
      if (!isImageKitConfigured()) {
        return status(503, { error: "Image uploads are not configured on this deployment" });
      }
      return generateImageKitUploadAuth(user.id);
    },
    {
      auth: true,
      query: t.Object({ type: t.Union([t.Literal("avatar"), t.Literal("banner")]) }),
      response: { 200: UploadAuthModel, 503: ErrorModel },
      detail: {
        summary: "Get ImageKit upload authorization",
        description: "Generates temporary credentials for direct browser-to-ImageKit upload.",
      },
    },
  )
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
      const { bio: rawBio, image: avatarImage, bannerImage, socialLinks } = body;

      let bio: RichContent | null | undefined;
      if (rawBio !== undefined) {
        const parsed = validateRichContent(rawBio, "bio");
        if (!parsed.ok) return status(422, { error: parsed.reason });
        // An empty bio stores as null, keeping one representation of "none".
        bio = isEmptyRichContent(parsed.value) ? null : parsed.value;
      }

      // Uploaded images must carry the server-mandated naming convention bound
      // to this user; anything else is a foreign or hand-crafted URL. Replaced
      // and removed files are not deleted here — the GC sweep handles cleanup.
      if (avatarImage && !parseImagePath(avatarImage, user.id, "avatar")) {
        return status(422, { error: "Invalid avatar image" });
      }
      if (bannerImage && !parseImagePath(bannerImage, user.id, "banner")) {
        return status(422, { error: "Invalid banner image" });
      }

      if (avatarImage !== undefined) {
        await userDal.updateUser(user.id, { image: avatarImage });
      }

      const [profile] = await profileDal.updateUserProfile(user.id, {
        ...(bannerImage !== undefined && { bannerImage }),
        ...(socialLinks !== undefined && { socialLinks }),
        ...(rawBio !== undefined && { bio }),
      });
      if (!profile) return status(500, { error: "Failed to update profile" });

      return {
        ...profile,
        image: avatarImage !== undefined ? avatarImage : (user.image ?? null),
      };
    },
    {
      auth: true,
      body: UpdateProfileModel,
      response: { 200: ProfileModel, 422: ErrorModel, 500: ErrorModel },
      detail: {
        summary: "Update my profile",
        description:
          "Updates the authenticated user's profile settings and avatar. Bio must be a valid Rich Content document for the bio preset.",
      },
    },
  );
