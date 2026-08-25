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
      documentation: {
        info: {
          title: "Tsuki API",
          description: "Anime tracking platform API",
          version: "1.0.50",
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
