import { treaty } from "@elysiajs/eden";

import type { App } from "@tsuki/api/src/app";

import { env } from "@tsuki/env";

export const api = treaty<App>(
  typeof window === "undefined" ? env.NEXT_PUBLIC_API_URL : `${env.NEXT_PUBLIC_APP_URL}/api`,
  {
    fetch: {
      credentials: "include",
    },
  },
);
