import { cors } from "@elysiajs/cors";
import { Elysia } from "elysia";
import { auth } from "./auth";
import { animeRoutes } from "./modules/anime";
import { urls } from "./lib/urls";

const betterAuth = new Elysia({ name: "better-auth" }).mount(auth.handler).macro({
  auth: {
    async resolve({ status, request: { headers } }) {
      const session = await auth.api.getSession({ headers });

      if (!session) return status(401);

      return {
        user: session.user,
        session: session.session,
      };
    },
  },
});

export const app = new Elysia()
  .onRequest(({ request }) => {
    console.log(`${request.method} ${new URL(request.url).pathname}`);
  })
  .use(
    cors({
      origin: urls.web,
      credentials: true,
    }),
  )
  .use(betterAuth)
  .use(animeRoutes)
  .get("/", () => "Tsuki API Running!");

export type App = typeof app;
