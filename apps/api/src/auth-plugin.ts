import { Elysia, status as error } from "elysia";
import { auth } from "@tsuki/auth/server";

export const authPlugin = new Elysia({ name: "better-auth" }).mount(auth.handler).macro({
  auth: {
    async resolve({ request: { headers } }) {
      const session = await auth.api.getSession({ headers });

      if (!session) return error(401, "Unauthorized");

      return {
        user: session.user,
        session: session.session,
      };
    },
  },
});
