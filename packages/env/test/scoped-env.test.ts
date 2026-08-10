import { expect, test } from "bun:test";

const appUrl = "http://localhost:3000";
const databaseUrl = "postgresql://user:pass@localhost:5432/tsuki";

test("web and database environments load without API credentials", async () => {
  const process = Bun.spawn(
    ["bun", "-e", 'await import("./src/web.ts"); await import("./src/db.ts");'],
    {
      cwd: import.meta.dirname + "/..",
      env: {
        ...Bun.env,
        DATABASE_URL: databaseUrl,
        NEXT_PUBLIC_APP_URL: appUrl,
        RESEND_API_KEY: undefined,
        RESEND_FROM_EMAIL: undefined,
      },
    },
  );

  expect(await process.exited).toBe(0);
});

test("API auth requires Resend credentials", async () => {
  const process = Bun.spawn(["bun", "-e", 'await import("../auth/src/server.ts");'], {
    cwd: import.meta.dirname + "/..",
    stderr: "pipe",
    env: {
      ...Bun.env,
      DATABASE_URL: databaseUrl,
      BETTER_AUTH_SECRET: "test-secret",
      NEXT_PUBLIC_APP_URL: appUrl,
      RESEND_API_KEY: undefined,
      RESEND_FROM_EMAIL: undefined,
    },
  });

  expect(await process.exited).toBe(1);
});
