import { headers } from "next/headers";
import { cache } from "react";
import { authClient } from "@/lib/auth-client";

export const auth = cache(async () => {
  const { data } = await authClient.getSession({
    fetchOptions: {
      headers: await headers(),
    },
  });

  return { session: data?.session ?? null, user: data?.user ?? null };
});
