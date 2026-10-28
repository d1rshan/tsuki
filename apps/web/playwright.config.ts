import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  use: {
    baseURL: process.env.NAVIGATION_TEST_URL ?? "http://localhost:3000",
    launchOptions: {
      executablePath: process.env.CHROMIUM_PATH,
    },
  },
});
