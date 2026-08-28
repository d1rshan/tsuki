import { Elysia, t, status } from "elysia";

import { profileDal, userDal } from "@tsuki/db";
import type { RichContent } from "@tsuki/rich-content";
import { isEmptyRichContent, validateRichContent } from "@tsuki/rich-content";

import { authPlugin } from "../../plugins/auth";
import { ErrorModel } from "../../plugins/errors";
import { deleteImageKitFile, generateImageKitUploadAuth } from "./imagekit";
import { buildUserOverview, requireUser } from "./service";
import { ProfileModel, UpdateProfileModel, UploadAuthModel, UserOverviewModel } from "./model";

// TODO: Rename `/users/:username` routes to `/profiles/:username` (and
// `/users/discover`, follower lists etc. in the social module) once the web
// app's Eden clients are updated alongside. Routes kept as-is for now to
// avoid a breaking change.

export const profilesRoutes = new Elysia({ tags: ["Profiles"] })
  .use(authPlugin)
  .get("/me/profile/upload-auth", () => generateImageKitUploadAuth(), {
    auth: true,
    response: { 200: UploadAuthModel },
    detail: {
      summary: "Get ImageKit upload authorization",
      description: "Generates temporary credentials for direct browser-to-ImageKit upload.",
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
  .put(
    "/me/profile",
    async ({ body, user }) => {
      const {
        bio: rawBio,
        image: avatarImage,
        oldAvatarFileId,
        oldBannerFileId,
        bannerImage,
        socialLinks,
      } = body;

      let bio: RichContent | null | undefined;
      if (rawBio !== undefined) {
        const parsed = validateRichContent(rawBio, "bio");
        if (!parsed.ok) return status(422, { error: parsed.reason });
        // An empty bio stores as null, keeping one representation of "none".
        bio = isEmptyRichContent(parsed.value) ? null : parsed.value;
      }

      let updatedUserImage: string | null | undefined;
      if (avatarImage !== undefined) {
        const [updatedUser] = await userDal.updateUser(user.id, { image: avatarImage });
        updatedUserImage = updatedUser?.image ?? avatarImage;
      }

      const [profile] = await profileDal.updateUserProfile(user.id, {
        ...(bannerImage !== undefined && { bannerImage }),
        ...(socialLinks !== undefined && { socialLinks }),
        ...(rawBio !== undefined && { bio }),
      });
      if (!profile) return status(500, { error: "Failed to update profile" });

      if (oldAvatarFileId) {
        void deleteImageKitFile(oldAvatarFileId);
      }
      if (oldBannerFileId) {
        void deleteImageKitFile(oldBannerFileId);
      }

      return {
        ...profile,
        image: updatedUserImage ?? user.image ?? null,
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
