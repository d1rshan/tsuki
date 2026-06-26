import { treaty } from "@elysiajs/eden";

import type { App } from "@tsuki/api/src/app";

import { urls } from "@/lib/urls";

export const api = treaty<App>(typeof window === "undefined" ? urls.api : `${urls.app}/api`, {
  fetch: {
    credentials: "include",
  },
});
