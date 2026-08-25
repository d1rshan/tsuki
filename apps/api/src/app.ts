import { Elysia } from "elysia";
import { openapi } from "@elysiajs/openapi";

import { authPlugin } from "./plugins/auth";
import { errorsPlugin } from "./plugins/errors";
import { loggerPlugin } from "./plugins/logger";
import { activityRoutes } from "./modules/activity";
import { libraryRoutes } from "./modules/library";
import { mediaRoutes } from "./modules/media";
import { profilesRoutes } from "./modules/profiles";
import { reviewRoutes } from "./modules/reviews";
import { socialRoutes } from "./modules/social";

export const app = new Elysia()
  .use(
    openapi({
      path: "/docs",
      documentation: {
        info: {
          title: "Tsuki API",
          description: "Anime tracking platform API",
          version: "1.0.50",
        },
        tags: [
          { name: "Media", description: "Anime & manga from AniList" },
          { name: "Library", description: "Personal watch/read lists" },
          { name: "Reviews", description: "Scored reviews" },
          { name: "Social", description: "Follows and discovery" },
          { name: "Activity", description: "Activity feed" },
          { name: "Profiles", description: "User profiles" },
          { name: "Auth", description: "Better Auth endpoints (mounted)" },
        ],
        components: {
          securitySchemes: {
            sessionCookie: {
              type: "apiKey",
              in: "cookie",
              name: "better-auth.session_token",
            },
          },
        },
      },
    }),
  )
  .use(errorsPlugin)
  .use(loggerPlugin)
  .use(authPlugin)
  .use(mediaRoutes)
  .use(libraryRoutes)
  .use(reviewRoutes)
  .use(socialRoutes)
  .use(activityRoutes)
  .use(profilesRoutes) // last: its `/users/:username` param route must not shadow static paths
  .get("/", () => "Tsuki API Running!");

export type App = typeof app;
export default app;
