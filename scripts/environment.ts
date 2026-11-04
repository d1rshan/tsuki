import { randomBytes } from "node:crypto";
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { parseEnv } from "node:util";

export const root = dirname(import.meta.dir);
export const localDatabaseUrl = "postgres://tsuki:tsuki@127.0.0.1:55432/tsuki";
export const localProxyUrl = "http://127.0.0.1:55433/sql";

const appKeys = [
  "DATABASE_URL",
  "LOCAL_DATABASE_HTTP_ENDPOINT",
  "BETTER_AUTH_SECRET",
  "SYNC_SECRET",
  "SYNC_CRON_BUDGET_MS",
  "CRON_SECRET",
  "RESEND_API_KEY",
  "RESEND_FROM_EMAIL",
  "IMAGEKIT_PRIVATE_KEY",
  "IMAGEKIT_PUBLIC_KEY",
  "IMAGEKIT_URL_ENDPOINT",
  "GOOGLE_SITE_VERIFICATION",
];

export function assertNoLegacyEnvFiles(base = root) {
  for (const directory of ["", "apps/web", "apps/api", "packages/db"]) {
    const path = join(base, directory);
    if (!existsSync(path)) continue;
    const files = readdirSync(path).filter(
      (file) =>
        (file === ".env" || file.startsWith(".env.")) &&
        file !== ".env.example" &&
        !(directory === "" && file === ".env"),
    );
    if (files.length) {
      throw new Error(
        `Remove legacy env files from ${directory || "repo root"}: ${files.join(", ")}. Use root .env for local settings and .secrets/neon.env for production DB commands.`,
      );
    }
  }
}

export function ensureLocalEnvironment(base = root) {
  const file = join(base, ".env");
  if (existsSync(file)) return;
  const example = readFileSync(join(base, ".env.example"), "utf8");
  writeFileSync(
    file,
    example.replace(
      /^BETTER_AUTH_SECRET=.*$/m,
      `BETTER_AUTH_SECRET=${randomBytes(32).toString("hex")}`,
    ),
    { mode: 0o600, flag: "wx" },
  );
}

export function loadEnvironment(
  target: "local" | "production",
  options: { base?: string; inherited?: NodeJS.ProcessEnv; appUrl?: string } = {},
): NodeJS.ProcessEnv {
  const base = options.base ?? root;
  const env = { ...(options.inherited ?? process.env) };
  for (const key of Object.keys(env)) {
    if (appKeys.includes(key) || key.startsWith("NEXT_PUBLIC_") || key === "NODE_ENV")
      delete env[key];
  }
  const path = join(base, target === "local" ? ".env" : ".secrets/neon.env");
  if (!existsSync(path))
    throw new Error(
      `Missing ${target === "local" ? ".env; run bun run setup" : ".secrets/neon.env; add DATABASE_URL for Neon"}.`,
    );
  const values = parseEnv(readFileSync(path, "utf8"));
  if (target === "production") {
    const url = parseDatabaseUrl(values.DATABASE_URL);
    if (!url.hostname.endsWith(".neon.tech"))
      throw new Error("Production DB commands require a Neon DATABASE_URL in .secrets/neon.env.");
    return { ...env, DATABASE_URL: values.DATABASE_URL!, NODE_ENV: "production" };
  }
  if (values.DATABASE_URL && values.DATABASE_URL !== localDatabaseUrl) {
    throw new Error(
      "Local .env must not override DATABASE_URL. Move Neon credentials to .secrets/neon.env; the launcher selects Docker Postgres.",
    );
  }
  if (!values.BETTER_AUTH_SECRET)
    throw new Error("Set BETTER_AUTH_SECRET in root .env (see .env.example).");
  // Service keys come from the file; connection and networking settings are owned here.
  return {
    ...env,
    ...values,
    DATABASE_URL: localDatabaseUrl,
    LOCAL_DATABASE_HTTP_ENDPOINT: localProxyUrl,
    NEXT_PUBLIC_APP_URL: options.appUrl ?? "http://localhost:3000",
    NEXT_PUBLIC_API_URL: "http://localhost:3001",
    NODE_ENV: "development",
  };
}

function parseDatabaseUrl(value?: string) {
  try {
    const url = new URL(value ?? "");
    if (!["postgres:", "postgresql:"].includes(url.protocol)) throw new Error();
    return url;
  } catch {
    throw new Error("DATABASE_URL must be a valid PostgreSQL connection URL.");
  }
}

export function describeDatabase(env: NodeJS.ProcessEnv) {
  const url = parseDatabaseUrl(env.DATABASE_URL);
  return `${url.hostname}${url.port ? `:${url.port}` : ""}${url.pathname}`;
}
