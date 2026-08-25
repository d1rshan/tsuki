import { Elysia, status } from "elysia";
import { auth } from "@tsuki/auth/server";

import { ErrorModel } from "./errors";

export const authPlugin = new Elysia({ name: "better-auth" }).mount(auth.handler).macro({
  auth: {
    // Declared here so every `auth: true` route carries a typed 401, rather than
    // each one repeating it in its own response map.
    response: { 401: ErrorModel },
    detail: { security: [{ sessionCookie: [] }] },
    async resolve({ request: { headers } }) {
      const session = await auth.api.getSession({ headers });

      if (!session) return status(401, { error: "Unauthorized" });

      return {
        user: session.user,
        session: session.session,
      };
    },
  },
  optionalAuth: {
    async resolve({ request: { headers } }) {
      const session = await auth.api.getSession({ headers });

      return { viewer: session?.user ?? null };
    },
  },
});
