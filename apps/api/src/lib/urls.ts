import { env } from "@tsuki/env";

export const WEB_BASE_URL = env.WEB_URL || "http://localhost:3000";

export const urls = {
  web: WEB_BASE_URL,
} as const;
