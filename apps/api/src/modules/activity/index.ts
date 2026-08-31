import { Elysia, t } from "elysia";

import { authPlugin } from "../../plugins/auth";
import { requireUser } from "../profiles/service";
import { getActivityFeed, getUserActivity } from "./service";
import { ActivityCursorQueryModel, ActivityFeedQueryModel, ActivityPageModel } from "./model";

export const activityRoutes = new Elysia({ tags: ["Activity"] })
  .use(authPlugin)
  .get("/me/activity", ({ query, user }) => getActivityFeed(user.id, query.type, query), {
    auth: true,
    query: ActivityFeedQueryModel,
    response: { 200: ActivityPageModel },
    detail: {
      summary: "Get the Activity Feed",
      description: "Newest-first Activity for Following or Public.",
    },
  })
  .get(
    "/users/:username/activity",
    async ({ params: { username }, query }) => {
      const user = await requireUser(username);
      return getUserActivity(user.id, query);
    },
    {
      optionalAuth: true,
      params: t.Object({ username: t.String() }),
      query: ActivityCursorQueryModel,
      response: { 200: ActivityPageModel },
      detail: {
        summary: "Get a user's Activity",
        description: "A Profile's own Logs and Reviews, newest-first. Public to any visitor.",
      },
    },
  );
