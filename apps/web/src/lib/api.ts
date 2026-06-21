import { treaty } from "@elysiajs/eden";
import { headers } from "next/headers";
import type { App } from "@tsuki/api/src/app";
import { urls } from "@/lib/urls";

export const api = treaty<App>(urls.api, {
  fetch: {
    credentials: "include",
  },
});

export const serverApi = async () => {
  const h = await headers();
  const cookie = h.get("cookie");

  return treaty<App>(urls.api, {
    headers: cookie ? { cookie } : undefined,
  });
};
