import { createAuthClient } from "better-auth/react";
import { adminClient, usernameClient } from "better-auth/client/plugins";

import { env } from "@tsuki/env";
import { ac, adminRolesObj } from "./permissions";

export const authClient = createAuthClient({
  baseURL: env.NEXT_PUBLIC_APP_URL,
  plugins: [
    usernameClient(),
    adminClient({
      ac,
      roles: adminRolesObj,
    }),
  ],
});

export const { signIn, signUp, signOut, useSession } = authClient;
