import { defineConfig } from "drizzle-kit";
import { env } from "@tsuki/env/db";

export default defineConfig({
  schema: "./src/schema/index.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
});
