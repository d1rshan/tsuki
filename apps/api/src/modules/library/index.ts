import { Elysia, t } from "elysia";

import { libraryDal, reviewsDal } from "@tsuki/db";

import { authPlugin } from "../../plugins/auth";
import { ErrorModel } from "../../plugins/errors";
import { MediaTypeEnum } from "../media/model";
import { requireUser } from "../profiles/service";
import { ReviewModel } from "../reviews/model";
import { LibraryEntryInputModel, LibraryEntryModel, LibraryQueryModel } from "./model";
import { logMedia, removeEntry } from "./service";

export const libraryRoutes = new Elysia()
  .use(authPlugin)
  .get(
    "/users/:username/library",
    async ({ params: { username }, query }) => {
      const user = await requireUser(username);
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
    ({ params: { type, id }, body, user }) => logMedia(user.id, type, id, body),
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
      await removeEntry(user.id, id);
      set.status = 204;
    },
    {
      auth: true,
      params: t.Object({ type: MediaTypeEnum, id: t.Numeric() }),
      detail: { summary: "Delete a library entry" },
    },
  );
