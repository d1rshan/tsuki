import { Elysia, t, status } from "elysia";

import { profileDal, userDal } from "@tsuki/db";
import type { RichContent } from "@tsuki/rich-content";
import { isEmptyRichContent, validateRichContent } from "@tsuki/rich-content";

import { authPlugin } from "../../plugins/auth";
import { ErrorModel } from "../../plugins/errors";
import {
  deleteImageKitFile,
  generateImageKitUploadAuth,
  isFileOwnedByUser,
  type ImageUploadType,
} from "./imagekit";
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
    ({ query, user }) => generateImageKitUploadAuth(user.id, query.type),
    {
      auth: true,
      query: t.Object({ type: t.Union([t.Literal("avatar"), t.Literal("banner")]) }),
      response: { 200: UploadAuthModel },
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
      const {
        bio: rawBio,
        image: avatarImage,
        avatarFileId,
        bannerImage,
        bannerFileId,
        socialLinks,
      } = body;

      let bio: RichContent | null | undefined;
      if (rawBio !== undefined) {
        const parsed = validateRichContent(rawBio, "bio");
        if (!parsed.ok) return status(422, { error: parsed.reason });
        // An empty bio stores as null, keeping one representation of "none".
        bio = isEmptyRichContent(parsed.value) ? null : parsed.value;
      }

      // Old fileIds come from the DB, never from the client: callers must not
      // be able to delete arbitrary ImageKit assets.
      const currentProfile = await profileDal.getProfileByUserId(user.id);
      const oldAvatarFileId = currentProfile?.avatarFileId ?? null;
      const oldBannerFileId = currentProfile?.bannerFileId ?? null;

      // New fileIds are only trusted after ImageKit confirms the file lives at
      // the path convention bound to this user; anything else stores as null.
      const verifiedFileId = async (
        fileId: string | null | undefined,
        hasImage: boolean,
        type: ImageUploadType,
      ) => {
        if (!hasImage || !fileId) return null;
        return (await isFileOwnedByUser(fileId, user.id, type)) ? fileId : null;
      };

      const storedAvatarFileId = await verifiedFileId(avatarFileId, Boolean(avatarImage), "avatar");
      const storedBannerFileId = await verifiedFileId(bannerFileId, Boolean(bannerImage), "banner");

      if (avatarImage !== undefined) {
        await userDal.updateUser(user.id, { image: avatarImage });
      }

      const [profile] = await profileDal.updateUserProfile(user.id, {
        ...(bannerImage !== undefined && { bannerImage }),
        ...(socialLinks !== undefined && { socialLinks }),
        ...(rawBio !== undefined && { bio }),
        // A fileId is only meaningful while its image URL is set.
        ...(avatarImage !== undefined && { avatarFileId: storedAvatarFileId }),
        ...(bannerImage !== undefined && { bannerFileId: storedBannerFileId }),
      });
      if (!profile) return status(500, { error: "Failed to update profile" });

      // Cleanup happens only after the DB update succeeded, so a failed update
      // never deletes the user's active image. Stored fileIds are verified as
      // the owner's own uploads, so no further ownership checks are needed.
      if (oldAvatarFileId && oldAvatarFileId !== profile.avatarFileId) {
        void deleteImageKitFile(oldAvatarFileId);
      }
      if (oldBannerFileId && oldBannerFileId !== profile.bannerFileId) {
        void deleteImageKitFile(oldBannerFileId);
      }

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
