import { Elysia, t } from "elysia";

import { authPlugin } from "../../plugins/auth";
import { ErrorModel } from "../../plugins/errors";
import { requireProfileAccess } from "../profiles/service";
import { getFollowingFeed, getPublicFeed, getUserActivity } from "./service";
import { ActivityCursorQueryModel, ActivityPageModel } from "./model";

export const activityRoutes = new Elysia({ tags: ["Activity"] })
  .use(authPlugin)
  .get("/activity", ({ query }) => getPublicFeed(query), {
    query: ActivityCursorQueryModel,
    response: { 200: ActivityPageModel },
    detail: {
      summary: "Get the Public Activity Feed",
      description: "Newest-first public Activity for any visitor, no session required.",
    },
  })
  .get("/me/activity", ({ query, user }) => getFollowingFeed(user.id, query), {
    auth: true,
    query: ActivityCursorQueryModel,
    response: { 200: ActivityPageModel },
    detail: {
      summary: "Get the Following Activity Feed",
      description: "Newest-first Activity from accounts the viewer follows.",
    },
  })
  .get(
    "/users/:username/activity",
    async ({ params: { username }, query, viewer }) => {
      const user = await requireProfileAccess(username, viewer?.id ?? null);
      return getUserActivity(user.id, query);
    },
    {
      optionalAuth: true,
      params: t.Object({ username: t.String() }),
      query: ActivityCursorQueryModel,
      response: { 200: ActivityPageModel, 403: ErrorModel, 404: ErrorModel },
      detail: {
        summary: "Get a user's Activity",
        description: "A Profile's own Logs, newest-first. Public to any visitor.",
      },
    },
  );
