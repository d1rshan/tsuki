import "client-only";

import { treaty } from "@elysiajs/eden";

import type { App } from "@tsuki/api";
import { env } from "@tsuki/env/web";

export const apiClient = treaty<App>(`${env.NEXT_PUBLIC_APP_URL}/api`, {
  fetch: { credentials: "include" },
});
