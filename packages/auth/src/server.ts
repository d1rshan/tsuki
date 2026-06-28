import { env } from "@tsuki/env";
import { betterAuth } from "better-auth";

import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, username } from "better-auth/plugins";
import { db } from "@tsuki/db";

import { ac, adminRolesObj } from "./permissions";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    username(),
    admin({
      adminRoles: ["admin", "owner"],
      ac,
      roles: adminRolesObj,
    }),
  ],
  trustedOrigins: [env.WEB_URL || env.NEXT_PUBLIC_APP_URL],
  session: {
    cookieCache: {
      enabled: true,
    },
  },
  advanced: {
    useSecureCookies: env.NODE_ENV === "production",
  },
});
