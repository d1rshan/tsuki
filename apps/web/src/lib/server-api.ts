import { headers } from "next/headers";
import { treaty } from "@elysiajs/eden";

import type { App } from "@tsuki/api/src/app";

import { env } from "@tsuki/env";

export const serverApi = async () => {
  const h = await headers();
  const cookie = h.get("cookie");

  return treaty<App>(env.NEXT_PUBLIC_API_URL, {
    headers: cookie ? { cookie } : undefined,
  });
};
