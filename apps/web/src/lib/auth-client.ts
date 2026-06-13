import { createAuthClient } from "better-auth/react";
import { usernameClient } from "better-auth/client/plugins";
import { urls } from "@/lib/urls";

export const authClient = createAuthClient({
    baseURL: urls.api,
    plugins: [
        usernameClient(),
    ],
});

export const { signIn, signUp, signOut, useSession } = authClient;
