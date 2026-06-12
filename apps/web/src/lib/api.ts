import { treaty } from "@elysiajs/eden";
import type { App } from "../../../api/src/app";
import { urls } from "@/lib/urls";

export const api = treaty<App>(urls.api, {
  fetch: {
    credentials: "include",
  },
});
