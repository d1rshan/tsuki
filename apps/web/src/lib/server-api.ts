import { headers } from "next/headers";
import { treaty } from "@elysiajs/eden";

import type { App } from "@tsuki/api/src/app";

import { urls } from "@/lib/urls";

export const serverApi = async () => {
  const h = await headers();
  const cookie = h.get("cookie");

  return treaty<App>(urls.api, {
    headers: cookie ? { cookie } : undefined,
  });
};
