import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, haveIBeenPwned, username } from "better-auth/plugins";

import { db } from "@tsuki/db";
import { env } from "@tsuki/env/api";

import { ac, adminRolesObj } from "./permissions";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    resetPasswordTokenExpiresIn: 60 * 30,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url }) => {
      const { sendEmail } = await import("./email");
      await sendEmail({
        actionLabel: "Reset password",
        actionUrl: url,
        description: "We received a request to reset your Tsuki password.",
        to: user.email,
        subject: "Reset your Tsuki password",
      });
    },
  },
  emailVerification: {
    autoSignInAfterVerification: true,
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url }) => {
      const { sendEmail } = await import("./email");
      await sendEmail({
        actionLabel: "Verify email",
        actionUrl: url,
        description: "Confirm your email to finish setting up your Tsuki account.",
        to: user.email,
        subject: "Verify your Tsuki email",
      });
    },
  },
  rateLimit: {
    customRules: {
      "/request-password-reset": { max: 1, window: 60 },
      "/send-verification-email": { max: 1, window: 60 },
      "/sign-up/email": { max: 1, window: 60 },
    },
    enabled: true,
    storage: "database",
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
