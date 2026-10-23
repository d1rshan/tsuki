import { randomBytes } from "node:crypto";
import {
  chmodSync,
  closeSync,
  existsSync,
  mkdirSync,
  openSync,
  readFileSync,
  renameSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { parseEnv } from "node:util";

const root = dirname(import.meta.dir);
const storage = join(root, ".local-dev");
const snapshot = join(storage, "catalog.dump");
const databaseUrl = "postgres://tsuki:tsuki@127.0.0.1:55432/tsuki";
const proxyUrl = "http://127.0.0.1:55433/sql";
const command = process.argv[2];
const commands = ["setup", "up", "sync", "snapshot", "stop"];
if (!commands.includes(command ?? "")) {
  throw new Error(`Usage: bun run scripts/local.ts ${commands.join(" | ")}`);
}

mkdirSync(storage, { recursive: true, mode: 0o700 });
chmodSync(storage, 0o700);

// All local commands use fixed local credentials, regardless of inherited .env.
const localEnv: Record<string, string> = {
  DATABASE_URL: databaseUrl,
  LOCAL_DATABASE_HTTP_ENDPOINT: proxyUrl,
  NEXT_PUBLIC_APP_URL: "http://localhost:3000",
  NEXT_PUBLIC_API_URL: "http://localhost:3001",
  NODE_ENV: "development",
};

async function run(
  args: string[],
  options: {
    cwd?: string;
    capture?: boolean;
    stdin?: ReturnType<typeof Bun.file>;
    stdout?: number;
  } = {},
) {
  const child = Bun.spawn(args, {
    cwd: options.cwd ?? root,
    env: { ...process.env, ...localEnv },
    stdin: options.stdin ?? "inherit",
    stdout: options.stdout ?? (options.capture ? "pipe" : "inherit"),
    stderr: "inherit",
  });
  const interrupt = () => child.kill("SIGINT");
  const terminate = () => child.kill("SIGTERM");
  process.once("SIGINT", interrupt);
  process.once("SIGTERM", terminate);
  try {
    const output = options.capture ? await new Response(child.stdout as ReadableStream).text() : "";
    if ((await child.exited) !== 0)
      throw new Error(`Command failed: ${args.slice(0, 4).join(" ")}`);
    return output.trim();
  } finally {
    process.off("SIGINT", interrupt);
    process.off("SIGTERM", terminate);
  }
}

const compose = (...args: string[]) => [
  "docker",
  "compose",
  "-f",
  join(root, "compose.yaml"),
  ...args,
];
const psql = async (query: string) =>
  run(
    compose(
      "exec",
      "-T",
      "postgres",
      "psql",
      "-U",
      "tsuki",
      "-d",
      "tsuki",
      "-At",
      "-v",
      "ON_ERROR_STOP=1",
      "-c",
      query,
    ),
    { capture: true },
  );

function configureEnvironment() {
  const files = [
    ".env.local",
    "apps/api/.env.local",
    "apps/web/.env.local",
    "packages/db/.env.local",
  ];
  const apiEnv = ["apps/api/.env", "apps/api/.env.local"].reduce<Record<string, string>>(
    (values, file) => ({
      ...values,
      ...(existsSync(join(root, file)) ? parseEnv(readFileSync(join(root, file), "utf8")) : {}),
    }),
    {},
  );
  localEnv.BETTER_AUTH_SECRET = apiEnv.BETTER_AUTH_SECRET || randomBytes(32).toString("hex");
  for (const relative of files) {
    const target = join(root, relative);
    let text = existsSync(target) ? readFileSync(target, "utf8") : "";
    const backup = join(storage, "env-backups", relative.replaceAll("/", "__"));
    if (text && !existsSync(backup)) {
      mkdirSync(dirname(backup), { recursive: true, mode: 0o700 });
      writeFileSync(backup, text, { mode: 0o600 });
    }
    for (const [key, value] of Object.entries(localEnv)) {
      if (key === "NODE_ENV") continue;
      const line = `${key}=${JSON.stringify(value)}`;
      const pattern = new RegExp(`^(?:export\\s+)?${key}\\s*=.*$`, "m");
      text = pattern.test(text) ? text.replace(pattern, line) : `${text.trimEnd()}\n${line}\n`;
    }
    // Rename replaces a possible worktree symlink instead of modifying its target.
    writeFileSync(`${target}.tmp`, text.trimStart(), { mode: 0o600 });
    renameSync(`${target}.tmp`, target);
    chmodSync(target, 0o600);
  }
  console.log(
    "Configured local database overrides in .env.local files; existing .env files are untouched.",
  );
}

async function up() {
  configureEnvironment();
  await run(compose("up", "-d", "--wait", "--wait-timeout", "120"));
  for (let attempt = 0; attempt < 30; attempt++) {
    try {
      const response = await fetch(proxyUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Neon-Connection-String": databaseUrl,
          "Neon-Raw-Text-Output": "true",
          "Neon-Array-Mode": "true",
        },
        body: JSON.stringify({ query: "select 1", params: [] }),
        signal: AbortSignal.timeout(2000),
      });
      if (response.ok) return;
    } catch {
      // Compose waits for Postgres; the proxy needs one additional readiness check.
    }
    await Bun.sleep(1000);
  }
  throw new Error("Local database proxy did not become ready. Run docker compose logs neon-proxy.");
}

async function complete() {
  if ((await psql("select to_regclass('public.sync_state') is not null")) !== "t") return false;
  return (
    (await psql(
      "select count(*) from sync_state where id in ('ANIME', 'MANGA') and last_completed_at is not null",
    )) === "2"
  );
}

async function saveSnapshot() {
  if (!(await complete()) || (await psql("select count(*) from media")) === "0") {
    throw new Error("Finish bun run local:setup before saving a complete catalog snapshot.");
  }
  const temporary = `${snapshot}.tmp`;
  const file = openSync(temporary, "w", 0o600);
  try {
    await run(
      compose(
        "exec",
        "-T",
        "postgres",
        "pg_dump",
        "-U",
        "tsuki",
        "-d",
        "tsuki",
        "--format=custom",
        "--data-only",
        "--table=public.media",
        "--no-owner",
        "--no-acl",
      ),
      { stdout: file },
    );
  } finally {
    closeSync(file);
  }
  renameSync(temporary, snapshot);
  console.log(
    "Saved catalog-only snapshot to .local-dev/catalog.dump (accounts and activity are excluded).",
  );
}

const lock = join(storage, "operation.lock");
function acquireLock() {
  if (existsSync(lock)) {
    const pid = Number(readFileSync(lock, "utf8"));
    try {
      process.kill(pid, 0);
      throw new Error(`Another local database command is running (PID ${pid}).`);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ESRCH") throw error;
      unlinkSync(lock);
    }
  }
  writeFileSync(lock, String(process.pid), { flag: "wx", mode: 0o600 });
  process.on("exit", () => {
    if (existsSync(lock) && readFileSync(lock, "utf8") === String(process.pid)) unlinkSync(lock);
  });
}

acquireLock();
try {
  if (command === "stop") {
    await run(compose("stop"));
    console.log("Stopped local services. Database volume and host snapshot are preserved.");
  } else {
    await up();
    if (command === "setup") {
      await run(["bun", "run", "db:push"], { cwd: join(root, "packages/db") });
      if (!(await complete())) {
        if ((await psql("select count(*) from media")) === "0" && existsSync(snapshot)) {
          console.log("Restoring the catalog snapshot into the empty local database...");
          await run(
            compose(
              "exec",
              "-T",
              "postgres",
              "pg_restore",
              "-U",
              "tsuki",
              "-d",
              "tsuki",
              "--data-only",
              "--no-owner",
              "--no-acl",
              "--single-transaction",
              "--exit-on-error",
            ),
            { stdin: Bun.file(snapshot) },
          );
          await psql(
            "insert into sync_state (id, status, last_completed_at) values ('ANIME', 'idle', now()), ('MANGA', 'idle', now()) on conflict (id) do update set status = 'idle', cursor = null, last_completed_at = now()",
          );
        } else {
          console.log(
            "Bootstrapping the complete Kitsu catalog. This can take hours; rerun local:setup to resume.",
          );
          await run(["bun", "run", "scripts/sync-bootstrap.ts", "--resume"], {
            cwd: join(root, "apps/api"),
          });
        }
      } else {
        console.log(
          "Existing completed catalog preserved. Run local:sync when you want fresh data.",
        );
      }
      await saveSnapshot();
      console.log("Local setup is ready. Start the app with bun run dev.");
    } else if (command === "sync") {
      if (!(await complete()))
        throw new Error("Run bun run local:setup to finish the first full catalog crawl.");
      await run(["bun", "run", "scripts/sync-bootstrap.ts", "--incremental"], {
        cwd: join(root, "apps/api"),
      });
      console.log("Local catalog refreshed. Run local:snapshot to update your saved snapshot.");
    } else if (command === "snapshot") {
      await saveSnapshot();
    } else {
      console.log("Local Postgres and HTTP proxy are ready.");
    }
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
