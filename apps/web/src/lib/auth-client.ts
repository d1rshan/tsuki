import { createAuthClient } from "better-auth/react";
import { adminClient, usernameClient } from "better-auth/client/plugins";

import { urls } from "@/lib/urls";
// TODO: move ac + adminRolesObj to a shared package (e.g. @tsuki/auth-config)
// and import from there once the permissions package is extracted.
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
