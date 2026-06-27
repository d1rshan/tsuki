import { betterAuth } from "better-auth";

import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, username } from "better-auth/plugins";
import { db } from "@tsuki/db";

import { urls } from "./lib/urls";

import { ac, adminRolesObj } from "./permissions";

// TODO: extract out auth as a new package to avoid roundtrip for server side checks in web app
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
