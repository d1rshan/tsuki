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
  trustedOrigins: [
    process.env.WEB_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ],
  session: {
    cookieCache: {
      enabled: true,
    },
  },
  advanced: {
    useSecureCookies: process.env.NODE_ENV === "production",
  },
});
