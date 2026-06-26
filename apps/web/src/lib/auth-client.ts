import { createAuthClient } from "better-auth/react";
import { adminClient, usernameClient } from "better-auth/client/plugins";

import { urls } from "@/lib/urls";

export const authClient = createAuthClient({
  baseURL: urls.app,
  plugins: [usernameClient(), adminClient()],
});

export const { signIn, signUp, signOut, useSession } = authClient;
