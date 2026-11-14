import { Elysia, t, status } from "elysia";

import { libraryDal, profileDal } from "@tsuki/db";
import type { RichContent } from "@tsuki/rich-content";
import { isEmptyRichContent, validateRichContent } from "@tsuki/rich-content";

import { authPlugin } from "../../plugins/auth";
import { ErrorModel } from "../../plugins/errors";
import {
  generateImageKitUploadAuth,
  isImageKitConfigured,
  parseImagePath,
  verifyUploadedImage,
} from "./imagekit";
import { buildUserOverview, requireProfileAccess, requireUser } from "./service";
import {
  ProfileIdentityModel,
  ProfileModel,
  ProfileStatisticsModel,
  UpdateProfileModel,
  UploadAuthModel,
  UserOverviewModel,
} from "./model";

import { processProfileMedia, removeSource, sourceUploadAuth } from "./media-processing";

import { summarizeStatistics } from "./statistics";

// TODO: Rename `/users/:username` routes to `/profiles/:username` (and
// `/users/discover`, follower lists etc. in the social module) once the web
// app's Eden clients are updated alongside. Routes kept as-is for now to
// avoid a breaking change.

export const profilesRoutes = new Elysia({ tags: ["Profiles"] })
  .use(authPlugin)
  .get(
    "/me/profile/upload-auth",
    ({ query, user }) => {
      if (!isImageKitConfigured()) {
        return status(503, { error: "Image uploads are not configured on this deployment" });
      }
      return query.extension
        ? sourceUploadAuth(user.id, query.type, query.extension)
        : generateImageKitUploadAuth(user.id, query.type);
    },
    {
      auth: true,
      query: t.Object({
        type: t.Union([t.Literal("avatar"), t.Literal("banner")]),
        extension: t.Optional(
          t.Union([
            t.Literal("jpg"),
            t.Literal("png"),
            t.Literal("webp"),
            t.Literal("gif"),
            t.Literal("mp4"),
          ]),
        ),
      }),
      response: { 200: UploadAuthModel, 503: ErrorModel },
      detail: {
        summary: "Get ImageKit upload authorization",
        description: "Generates temporary credentials for direct browser-to-ImageKit upload.",
      },
    },
  )
  .post(
    "/me/profile/process-media",
    async ({ body, user }) => {
      if (!isImageKitConfigured())
        return status(503, { error: "Media uploads are not configured." });
      try {
        const url = await processProfileMedia(user.id, body);
        return { url, pending: url === null };
      } catch (error) {
        return status(422, {
          error: error instanceof Error ? error.message : "Processing failed. Please try again.",
        });
      }
    },
    {
      auth: true,
      body: t.Object({
        fileId: t.String({ minLength: 1, maxLength: 100 }),
        type: t.Union([t.Literal("avatar"), t.Literal("banner")]),
        crop: t.Object({
          x: t.Number({ minimum: 0, maximum: 20000 }),
          y: t.Number({ minimum: 0, maximum: 20000 }),
          width: t.Number({ minimum: 2, maximum: 20000 }),
          height: t.Number({ minimum: 2, maximum: 20000 }),
        }),
        start: t.Number({ minimum: 0, maximum: 86400 }),
        duration: t.Number({ minimum: 0.1, maximum: 6 }),
      }),
      response: {
        200: t.Object({ url: t.Nullable(t.String()), pending: t.Boolean() }),
        422: ErrorModel,
        503: ErrorModel,
      },
    },
  )
  .delete(
    "/me/profile/source-upload",
    async ({ body, user }) => {
      try {
        await removeSource(body.fileId, user.id, body.type);
        return { success: true };
      } catch {
        return status(422, { error: "Could not remove temporary upload." });
      }
    },
    {
      auth: true,
      body: t.Object({
        fileId: t.String({ maxLength: 100 }),
        type: t.Union([t.Literal("avatar"), t.Literal("banner")]),
      }),
      response: { 200: t.Object({ success: t.Boolean() }), 422: ErrorModel },
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
  .get(
    "/users/:username/identity",
    async ({ params: { username } }) => {
      const user = await requireUser(username);
      const profile = user.isPrivate ? null : await profileDal.getProfileByUserId(user.id);
      return {
        user: {
          id: user.id,
          name: user.name,
          username: user.username,
          displayUsername: user.displayUsername,
          image: user.image,
          createdAt: user.createdAt,
        },
        isPrivate: user.isPrivate,
        bannerImage: profile?.bannerImage ?? null,
      };
    },
    {
      params: t.Object({ username: t.String() }),
      response: { 200: ProfileIdentityModel, 404: ErrorModel },
      detail: { summary: "Get public profile header identity" },
    },
  )
  .get(
    "/users/:username/stats",
    async ({ params: { username }, viewer }) => {
      const user = await requireProfileAccess(username, viewer?.id ?? null);
      return summarizeStatistics(await libraryDal.getUserStatistics(user.id));
    },
    {
      optionalAuth: true,
      params: t.Object({ username: t.String() }),
      response: { 200: ProfileStatisticsModel, 403: ErrorModel, 404: ErrorModel },
      detail: { summary: "Get a user's library statistics" },
    },
  )
  .put(
    "/me/profile",
    async ({ body, user }) => {
      const { bio: rawBio, image: avatarImage, bannerImage, socialLinks, isPrivate } = body;

      let bio: RichContent | null | undefined;
      if (rawBio !== undefined) {
        // A cleared bio arrives as null from the form; an empty doc collapses
        // to null too, keeping one representation of "none".
        if (rawBio === null) {
          bio = null;
        } else {
          const parsed = validateRichContent(rawBio, "bio");
          if (!parsed.ok) return status(422, { error: parsed.reason });
          bio = isEmptyRichContent(parsed.value) ? null : parsed.value;
        }
      }

      // Uploaded images must carry the server-mandated naming convention bound
      // to this user; anything else is a foreign or hand-crafted URL. Replaced
      // and removed files are not deleted here — the GC sweep handles cleanup.
      // The binary bypassed this server, so uploaded files are also HEAD-verified
      // for type and size before their URL is persisted.
      for (const [url, type] of [
        [avatarImage, "avatar"],
        [bannerImage, "banner"],
      ] as const) {
        if (!url) continue;
        const animation = new URLSearchParams(url.split("#")[1]).get("video");
        if (
          !parseImagePath(url, user.id, type) ||
          (animation && !parseImagePath(animation, user.id, type))
        ) {
          return status(422, { error: `Invalid ${type} image` });
        }
        const verificationError = await verifyUploadedImage(url, type);
        if (verificationError) return status(422, { error: verificationError });
      }

      const profileData = {
        ...(bannerImage !== undefined && { bannerImage }),
        ...(socialLinks !== undefined && { socialLinks }),
        ...(rawBio !== undefined && { bio }),
      };

      const {
        profile,
        image,
        isPrivate: privacy,
      } = await profileDal.updateUserProfile(user.id, profileData, {
        ...(avatarImage !== undefined && { image: avatarImage }),
        ...(isPrivate !== undefined && { isPrivate }),
      });
      if (!profile) return status(500, { error: "Failed to update profile" });
      return { ...profile, image, isPrivate: privacy };
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
