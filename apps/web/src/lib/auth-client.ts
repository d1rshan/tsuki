import { createAuthClient } from "better-auth/react";
import { urls } from "@/lib/urls";

export const authClient = createAuthClient({
    baseURL: urls.api.base,
});

export const { signIn, signUp, signOut, useSession } = authClient;
