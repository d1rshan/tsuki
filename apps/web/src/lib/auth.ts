import { headers } from "next/headers";
import { cache } from "react";
import { auth as serverAuth } from "@tsuki/auth/server";

// The `AbortError` this logs on every dev page load is expected noise from
// Next's warmup render pass, not a DB failure — see the note in packages/db/src/db.ts.
export const auth = cache(async () => {
  const session = await serverAuth.api.getSession({
    headers: await headers(),
  });

  return session ?? { session: null, user: null };
});
