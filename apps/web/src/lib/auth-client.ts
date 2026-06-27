import { createAuthClient } from "better-auth/react";
import { adminClient, usernameClient } from "better-auth/client/plugins";

import { urls } from "@/lib/urls";
import { ac, adminRolesObj } from "@tsuki/api/src/permissions";

export const authClient = createAuthClient({
  baseURL: urls.app,
  plugins: [
    usernameClient(),
    adminClient({
      ac,
      roles: adminRolesObj,
    }),
  ],
});

export const { signIn, signUp, signOut, useSession } = authClient;
