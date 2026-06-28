import { env } from "@tsuki/env";

export const urls = {
  api: env.NEXT_PUBLIC_API_URL,
  app: env.NEXT_PUBLIC_APP_URL,
} as const;
