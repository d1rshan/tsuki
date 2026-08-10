import "server-only";

import { headers } from "next/headers";
import { treaty } from "@elysiajs/eden";

import type { App } from "@tsuki/api";
import { env } from "@tsuki/env/web";

export async function getServerApi() {
  const cookie = (await headers()).get("cookie");

  return treaty<App>(env.NEXT_PUBLIC_API_URL, {
    headers: cookie ? { cookie } : undefined,
  });
}
