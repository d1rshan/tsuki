import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    env: {
      DATABASE_URL: "postgresql://user:pass@localhost:5432/tsuki",
      BETTER_AUTH_SECRET: "test-better-auth-secret-123456",
      NEXT_PUBLIC_APP_URL: "http://localhost:3000",
      IMAGEKIT_PRIVATE_KEY: "test_private_key_12345",
      IMAGEKIT_PUBLIC_KEY: "test_public_key_12345",
      IMAGEKIT_URL_ENDPOINT: "https://ik.imagekit.io/tsuki",
    },
  },
});
