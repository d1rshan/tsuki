import { headers } from "next/headers";
import { cache } from "react";
import { auth as serverAuth } from "@tsuki/auth/server";

export const auth = cache(async () => {
  const session = await serverAuth.api.getSession({
    headers: await headers(),
  });

  return session ?? { session: null, user: null };
});
