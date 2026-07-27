import { Elysia } from "elysia";

import { authPlugin } from "./plugins/auth";
import { errorsPlugin } from "./plugins/errors";
import { loggerPlugin } from "./plugins/logger";
import { libraryRoutes } from "./modules/library";
import { mediaRoutes } from "./modules/media";
import { reviewRoutes } from "./modules/reviews";
import { userRoutes } from "./modules/users";

export const app = new Elysia()
  .use(errorsPlugin)
  .use(loggerPlugin)
  .use(authPlugin)
  .use(mediaRoutes)
  .use(libraryRoutes)
  .use(reviewRoutes)
  .use(userRoutes)
  .get("/", () => "Tsuki API Running!");

export type App = typeof app;
export default app;
