import { Elysia, t } from "elysia";

const ANILIST_API_URL = "https://graphql.anilist.co";

const app = new Elysia()
  .get("/", () => "AniLog API Proxy Running!")
  .post("/graphql", async ({ body }) => {
    try {
      const response = await fetch(ANILIST_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("AniList Proxy Error:", error);
      return new Response(JSON.stringify({ error: "Failed to fetch from AniList" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  }, {
    body: t.Object({
      query: t.String(),
      variables: t.Optional(t.Any())
    })
  })
  .listen(3001);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
