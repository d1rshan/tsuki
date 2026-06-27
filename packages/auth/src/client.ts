import { createAuthClient } from "better-auth/react";
import { adminClient, usernameClient } from "better-auth/client/plugins";

import { ac, adminRolesObj } from "./permissions";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  plugins: [
    usernameClient(),
    adminClient({
      ac,
      roles: adminRolesObj,
    }),
  ],
});

export const { signIn, signUp, signOut, useSession } = authClient;
