import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, haveIBeenPwned, username } from "better-auth/plugins";

import { db } from "@tsuki/db";
import { env } from "@tsuki/env";

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
    haveIBeenPwned({
      customPasswordCompromisedMessage: "Choose a password that has not appeared in a data breach.",
    }),
    admin({
      adminRoles: ["admin", "owner"],
      ac,
      roles: adminRolesObj,
    }),
  ],
  baseURL: `${env.NEXT_PUBLIC_APP_URL}/api/auth`,
  trustedOrigins: [env.NEXT_PUBLIC_APP_URL],
  session: {
    cookieCache: {
      enabled: true,
    },
  },
  advanced: {
    useSecureCookies: env.NEXT_PUBLIC_APP_URL.startsWith("https://"),
  },
});
