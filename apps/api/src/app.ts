import { Elysia } from "elysia";

import { authPlugin } from "./auth-plugin";
import { animeRoutes } from "./modules/anime";
import { userRoutes } from "./modules/users";

export const app = new Elysia()
  .onError(({ code, error: err, set }) => {
    if (code === "VALIDATION") {
      set.status = 400;
      return {
        success: false,
        error: "Validation failed",
        details: err.all,
      };
    }

    if (code === "NOT_FOUND") {
      set.status = 404;
      return { success: false, error: err.message };
    }

    console.error("Unhandled Error:", err);
    set.status = 500;
    return {
      success: false,
      error: "An unexpected internal server error occurred",
    };
  })
  .onRequest(({ request }) => {
    console.log(`${request.method} ${new URL(request.url).pathname}`);
  })
  .use(authPlugin)
  .use(animeRoutes)
  .use(userRoutes)
  .get("/", () => "Tsuki API Running!");

export type App = typeof app;
export default app;
