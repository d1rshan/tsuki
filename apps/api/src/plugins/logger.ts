import { Elysia } from "elysia";

// onRequest runs before routing, so it already applies to every request.
export const loggerPlugin = new Elysia({ name: "logger" }).onRequest(({ request }) => {
  console.log(`${request.method} ${new URL(request.url).pathname}`);
});
