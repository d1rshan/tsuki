import { Elysia } from "elysia";

import { authPlugin } from "../../plugins/auth";
import { getActivityFeed } from "./service";
import { FeedModel, FeedQueryModel } from "./model";

export const activityRoutes = new Elysia({ tags: ["Activity"] })
  .use(authPlugin)
  .get("/me/activity", ({ query, user }) => getActivityFeed(user.id, query.type, query), {
    auth: true,
    query: FeedQueryModel,
    response: { 200: FeedModel },
    detail: {
      summary: "Get the Activity Feed",
      description: "Newest-first Activity for Following or Public.",
    },
  });
