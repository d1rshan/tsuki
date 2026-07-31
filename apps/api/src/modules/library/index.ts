import { Elysia, t, status } from "elysia";

import { libraryDal, reviewsDal, userDal } from "@tsuki/db";

import { authPlugin } from "../../plugins/auth";
import { ErrorModel } from "../../plugins/errors";
import { ensureMediaExists } from "../media";
import { MediaTypeEnum } from "../media/model";
import { ReviewModel } from "../reviews/model";
import { LibraryEntryInputModel, LibraryEntryModel, LibraryQueryModel } from "./model";

export const libraryRoutes = new Elysia()
  .use(authPlugin)
  .get(
    "/users/:username/library",
    async ({ params: { username }, query }) => {
      const user = await userDal.getUserByUsername(username);
      if (!user) return status(404, { error: "User not found" });

      return libraryDal.getUserLibrary(user.id, query);
    },
    {
      params: t.Object({ username: t.String() }),
      query: LibraryQueryModel,
      response: { 200: t.Array(LibraryEntryModel), 404: ErrorModel },
      detail: {
        summary: "Get a user's library",
        description: "Omit `type` to get anime and manga together, most recently updated first.",
      },
    },
  )
  .get(
    "/me/library/:type/:id",
    async ({ params: { id }, user }) => {
      const [entry, review] = await Promise.all([
        libraryDal.getEntry(user.id, id),
        reviewsDal.getReview(user.id, id),
      ]);

      return {
        entry: entry ?? null,
        review: review ?? null,
      };
    },
    {
      auth: true,
      params: t.Object({ type: MediaTypeEnum, id: t.Numeric() }),
      response: {
        200: t.Object({
          entry: t.Nullable(LibraryEntryModel),
          review: t.Nullable(ReviewModel),
        }),
      },
      detail: {
        summary: "Get my entry and review for one media",
        description: "Everything the current user has recorded against this title.",
      },
    },
  )
  .put(
    "/me/library/:type/:id",
    async ({ params: { type: mediaType, id }, body, user }) => {
      // The entry carries a foreign key to media, and logging from a search
      // result or profile grid can be the first time we have seen this title.
      if (!(await ensureMediaExists(mediaType, id))) {
        return status(404, { error: "Media not found" });
      }

      await libraryDal.upsertEntry({ userId: user.id, mediaId: id, mediaType, ...body });

      const entry = await libraryDal.getEntry(user.id, id);
      if (!entry) return status(500, { error: "Failed to save entry" });

      return entry;
    },
    {
      auth: true,
      params: t.Object({ type: MediaTypeEnum, id: t.Numeric() }),
      body: LibraryEntryInputModel,
      response: { 200: LibraryEntryModel, 404: ErrorModel, 500: ErrorModel },
      detail: {
        summary: "Log media",
        description: "Creates or updates the entry. Omitted fields keep their current value.",
      },
    },
  )
  .delete(
    "/me/library/:type/:id",
    async ({ params: { id }, user, set }) => {
      await libraryDal.deleteEntry(user.id, id);
      set.status = 204;
    },
    {
      auth: true,
      params: t.Object({ type: MediaTypeEnum, id: t.Numeric() }),
      detail: { summary: "Delete a library entry" },
    },
  );
