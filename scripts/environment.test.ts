import { afterEach, expect, test } from "bun:test";
import {
  copyFileSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import {
  assertNoLegacyEnvFiles,
  describeDatabase,
  ensureLocalEnvironment,
  loadEnvironment,
  localDatabaseUrl,
  localProxyUrl,
  root,
} from "./environment";

const directories: string[] = [];
afterEach(() => {
  for (const directory of directories.splice(0))
    rmSync(directory, { recursive: true, force: true });
});

function fixture() {
  const base = mkdtempSync(join(tmpdir(), "tsuki-env-"));
  directories.push(base);
  mkdirSync(join(base, ".secrets"));
  writeFileSync(
    join(base, ".env"),
    "BETTER_AUTH_SECRET=local-secret\nNEXT_PUBLIC_GIPHY_REVIEW_KEY=local-giphy\n",
  );
  writeFileSync(
    join(base, ".secrets/neon.env"),
    'DATABASE_URL="postgresql://user:password@production.neon.tech/catalog?sslmode=require"\n',
  );
  return base;
}

test("local commands replace inherited production settings and keep optional local keys", () => {
  const env = loadEnvironment("local", {
    base: fixture(),
    inherited: {
      PATH: "/bin",
      DATABASE_URL: "postgres://prod.neon.tech/prod",
      BETTER_AUTH_SECRET: "prod-secret",
      RESEND_API_KEY: "prod-email",
      NEXT_PUBLIC_APP_URL: "https://tsuki.fun",
      NODE_ENV: "production",
    },
  });
  expect(env.DATABASE_URL).toBe(localDatabaseUrl);
  expect(env.LOCAL_DATABASE_HTTP_ENDPOINT).toBe(localProxyUrl);
  expect(env.NEXT_PUBLIC_APP_URL).toBe("http://localhost:3000");
  expect(env.BETTER_AUTH_SECRET).toBe("local-secret");
  expect(env.NEXT_PUBLIC_GIPHY_REVIEW_KEY).toBe("local-giphy");
  expect(env.RESEND_API_KEY).toBeUndefined();
  expect(env.PATH).toBe("/bin");
  expect(env.NODE_ENV).toBe("development");
});

test("mobile changes only the app address", () => {
  const base = fixture();
  const local = loadEnvironment("local", { base, inherited: {} });
  const mobile = loadEnvironment("local", {
    base,
    inherited: {},
    appUrl: "http://100.64.0.1:3000",
  });
  expect(mobile).toEqual({ ...local, NEXT_PUBLIC_APP_URL: "http://100.64.0.1:3000" });
});

test("production loads only the explicit Neon URL and strips inherited local proxy and service keys", () => {
  const env = loadEnvironment("production", {
    base: fixture(),
    inherited: {
      DATABASE_URL: localDatabaseUrl,
      LOCAL_DATABASE_HTTP_ENDPOINT: localProxyUrl,
      BETTER_AUTH_SECRET: "local-secret",
      RESEND_API_KEY: "local-email",
    },
  });
  expect(env).toEqual({
    DATABASE_URL: "postgresql://user:password@production.neon.tech/catalog?sslmode=require",
    NODE_ENV: "production",
  });
  expect(describeDatabase(env)).toBe("production.neon.tech/catalog");
  expect(describeDatabase(env)).not.toContain("password");
});

test("production rejects local, malformed and non-Neon URLs without revealing credentials", () => {
  const base = fixture();
  for (const url of [
    localDatabaseUrl,
    "invalid",
    "https://user:secret@production.neon.tech/db",
    "postgres://user:secret@production.neon.tech.attacker.test/db",
  ]) {
    writeFileSync(join(base, ".secrets/neon.env"), `DATABASE_URL=${url}\n`);
    expect(() => loadEnvironment("production", { base })).toThrow();
  }
});

test("missing production config never falls back to local or inherited credentials", () => {
  const base = fixture();
  rmSync(join(base, ".secrets/neon.env"));
  expect(() =>
    loadEnvironment("production", {
      base,
      inherited: { DATABASE_URL: "postgres://prod.neon.tech/db" },
    }),
  ).toThrow("Missing .secrets/neon.env");
});

test("remote URL in local .env fails instead of silently selecting a database", () => {
  const base = fixture();
  writeFileSync(
    join(base, ".env"),
    "DATABASE_URL=postgres://prod.neon.tech/db\nBETTER_AUTH_SECRET=secret\n",
  );
  expect(() => loadEnvironment("local", { base })).toThrow(
    "Local .env must not override DATABASE_URL",
  );
});

test("legacy env files are rejected before tools can load them", () => {
  const base = fixture();
  assertNoLegacyEnvFiles(base);
  mkdirSync(join(base, "apps/web"), { recursive: true });
  writeFileSync(join(base, "apps/web/.env.local"), "DATABASE_URL=stale");
  expect(() => assertNoLegacyEnvFiles(base)).toThrow("Remove legacy env files from apps/web");
});

test("setup generates a private auth secret once and preserves existing local config", () => {
  const base = fixture();
  rmSync(join(base, ".env"));
  writeFileSync(join(base, ".env.example"), "BETTER_AUTH_SECRET=\nRESEND_API_KEY=\n");
  ensureLocalEnvironment(base);
  const text = readFileSync(join(base, ".env"), "utf8");
  expect(text).toMatch(/BETTER_AUTH_SECRET=[a-f0-9]{64}/);
  expect(statSync(join(base, ".env")).mode & 0o777).toBe(0o600);
  ensureLocalEnvironment(base);
  expect(readFileSync(join(base, ".env"), "utf8")).toBe(text);
});

test("the root CLI ignores an inherited Neon target and dry-run performs no DB operation", () => {
  const base = fixture();
  mkdirSync(join(base, "scripts"));
  for (const file of ["run.ts", "environment.ts"])
    copyFileSync(join(root, "scripts", file), join(base, "scripts", file));
  const child = Bun.spawnSync(["bun", "--no-env-file", "scripts/run.ts", "db:push", "--dry-run"], {
    cwd: base,
    env: {
      ...process.env,
      DATABASE_URL: "postgres://user:secret@unexpected.neon.tech/db",
      LOCAL_DATABASE_HTTP_ENDPOINT: "http://unexpected.test",
    },
  });
  const output = child.stdout.toString();
  expect(child.exitCode).toBe(0);
  expect(output).toContain("Database: 127.0.0.1:55432/tsuki");
  expect(output).toContain("Would run: bun --no-env-file src/triggers.ts");
  expect(output).not.toContain("unexpected");
});
