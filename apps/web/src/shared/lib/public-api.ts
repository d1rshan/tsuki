import "server-only";

import { treaty } from "@elysiajs/eden";

import type { App } from "@tsuki/api";
import { env } from "@tsuki/env";

export const publicApi = treaty<App>(env.NEXT_PUBLIC_API_URL);
