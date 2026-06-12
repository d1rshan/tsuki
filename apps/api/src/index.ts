import { Elysia, t } from "elysia";
import { cors } from "@elysiajs/cors";
import { auth } from "./auth";

const ANILIST_API_URL = "https://graphql.anilist.co";

const betterAuth = new Elysia({ name: "better-auth" })
  .mount(auth.handler)
  .macro({
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

const app = new Elysia()
  .use(
    cors({
      origin: "http://localhost:3000",
      credentials: true,
    })
  )
  .use(betterAuth)
  .get("/", () => "AniLog API Proxy Running!")
  .post("/graphql", async ({ body }) => {
    try {
      const response = await fetch(ANILIST_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("AniList Proxy Error:", error);
      return new Response(
        JSON.stringify({ error: "Failed to fetch from AniList" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  }, {
    body: t.Object({
      query: t.String(),
      variables: t.Optional(t.Any()),
    }),
  })
  .listen(3001);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
