import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.url(),
    LOCAL_DATABASE_HTTP_ENDPOINT: z.url().optional(),
  },
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    LOCAL_DATABASE_HTTP_ENDPOINT: process.env.LOCAL_DATABASE_HTTP_ENDPOINT,
  },
});
