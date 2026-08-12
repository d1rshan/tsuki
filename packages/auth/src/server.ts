import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { APIError } from "better-auth/api";
import { admin, haveIBeenPwned, username } from "better-auth/plugins";

import { db } from "@tsuki/db";
import { env } from "@tsuki/env/api";

import { ac, adminRolesObj } from "./permissions";
import { isUsernameChangeOnCooldown } from "./username-change";

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
  user: {
    additionalFields: {
      usernameChangedAt: {
        input: false,
        required: false,
        type: "date",
      },
    },
  },
  databaseHooks: {
    user: {
      update: {
        async before(data, context) {
          const changesUsername =
            typeof data.username === "string" || typeof data.displayUsername === "string";
          if (context?.path !== "/update-user" || !changesUsername) return;

          const session = context.context.session;
          if (!session) return;

          const currentUser = await db.query.user.findFirst({
            where: (user, { eq }) => eq(user.id, session.user.id),
          });

          if (!currentUser) return;

          const username =
            typeof data.username === "string" ? data.username.toLowerCase() : currentUser.username;
          const displayUsername =
            typeof data.displayUsername === "string"
              ? data.displayUsername
              : currentUser.displayUsername;
          if (
            currentUser.username === username &&
            currentUser.displayUsername === displayUsername
          ) {
            return;
          }

          if (isUsernameChangeOnCooldown(currentUser.usernameChangedAt)) {
            throw APIError.from("TOO_MANY_REQUESTS", {
              code: "USERNAME_CHANGE_COOLDOWN",
              message:
                "You can change your username once every 7 days. Please try again after your cooldown ends.",
            });
          }

          return { data: { usernameChangedAt: new Date() } };
        },
      },
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
