import { betterAuth } from "better-auth";

import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, username } from "better-auth/plugins";
import { db } from "@tsuki/db";

import { urls } from "./lib/urls";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [username(), admin()],
  trustedOrigins: [urls.web],
  session: {
    cookieCache: {
      enabled: true,
    },
  },
  advanced: {
    useSecureCookies: process.env.NODE_ENV === "production",
  },
});
