import { spawnSync } from "node:child_process";
import { expect, test } from "vitest";

const appUrl = "http://localhost:3000";
const databaseUrl = "postgresql://user:pass@localhost:5432/tsuki";

function runWithoutEmailCredentials(script: string) {
  const { RESEND_API_KEY: _apiKey, RESEND_FROM_EMAIL: _fromEmail, ...baseEnv } = process.env;

  return spawnSync("bun", ["-e", script], {
    cwd: import.meta.dirname + "/..",
    encoding: "utf8",
    env: {
      ...baseEnv,
      DATABASE_URL: databaseUrl,
      BETTER_AUTH_SECRET: "test-secret",
      NEXT_PUBLIC_APP_URL: appUrl,
    },
  });
}

test("the web auth server loads without email credentials", () => {
  const result = runWithoutEmailCredentials('await import("../auth/src/server.ts");');

  expect(result.status).toBe(0);
});

test("sending email requires Resend credentials", () => {
  const result = runWithoutEmailCredentials(
    'const { sendEmail } = await import("../auth/src/email.ts"); await sendEmail({ to: "test@example.com", subject: "Test", text: "Test" });',
  );

  expect(result.status).toBe(1);
});
