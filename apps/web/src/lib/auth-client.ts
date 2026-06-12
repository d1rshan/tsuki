import { createAuthClient } from "better-auth/react";
import { urls } from "@/lib/urls";

export const authClient = createAuthClient({
    baseURL: urls.api,
});

export const { signIn, signUp, signOut, useSession } = authClient;
