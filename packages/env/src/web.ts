import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  clientPrefix: "NEXT_PUBLIC_",
  client: {
    NEXT_PUBLIC_APP_URL: z.url().default("http://localhost:3000"),
    NEXT_PUBLIC_API_URL: z.url().default("http://localhost:3001"),
    NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY: z.string().default(""),
    NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT: z.string().default(""),
    // Giphy public web keys, scoped per section as their API terms require.
    NEXT_PUBLIC_GIPHY_BIO_KEY: z.string().default(""),
    NEXT_PUBLIC_GIPHY_REVIEW_KEY: z.string().default(""),
  },
  runtimeEnv: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY,
    NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT,
    NEXT_PUBLIC_GIPHY_BIO_KEY: process.env.NEXT_PUBLIC_GIPHY_BIO_KEY,
    NEXT_PUBLIC_GIPHY_REVIEW_KEY: process.env.NEXT_PUBLIC_GIPHY_REVIEW_KEY,
  },
});
