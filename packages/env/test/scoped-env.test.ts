import { expect, test } from "bun:test";

const appUrl = "http://localhost:3000";
const databaseUrl = "postgresql://user:pass@localhost:5432/tsuki";

test("the web auth server loads without email credentials", async () => {
  const process = Bun.spawn(["bun", "-e", 'await import("../auth/src/server.ts");'], {
    cwd: import.meta.dirname + "/..",
    env: {
      ...Bun.env,
      DATABASE_URL: databaseUrl,
      BETTER_AUTH_SECRET: "test-secret",
      NEXT_PUBLIC_APP_URL: appUrl,
      RESEND_API_KEY: undefined,
      RESEND_FROM_EMAIL: undefined,
    },
  });

  expect(await process.exited).toBe(0);
});

test("sending email requires Resend credentials", async () => {
  const process = Bun.spawn(
    [
      "bun",
      "-e",
      'const { sendEmail } = await import("../auth/src/email.ts"); await sendEmail({ to: "test@example.com", subject: "Test", text: "Test" });',
    ],
    {
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
    },
  );

  expect(await process.exited).toBe(1);
});
