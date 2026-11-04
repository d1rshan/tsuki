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
import { join } from "node:path";

import {
  assertNoLegacyEnvFiles,
  ensureLocalEnvironment,
  loadEnvironment,
  localDatabaseUrl,
  localProxyUrl,
  root,
} from "./environment";

const storage = join(root, ".local-dev");
const snapshot = join(storage, "catalog.dump");
const databaseUrl = localDatabaseUrl;
const proxyUrl = localProxyUrl;
const command = process.argv[2];
const commands = ["setup", "up", "sync", "snapshot", "stop"];
if (!commands.includes(command ?? "")) {
  throw new Error(`Usage: bun run scripts/local.ts ${commands.join(" | ")}`);
}

mkdirSync(storage, { recursive: true, mode: 0o700 });
chmodSync(storage, 0o700);

assertNoLegacyEnvFiles();
ensureLocalEnvironment();
// Never inherit a remote database target, including when invoked directly.
const localEnv = loadEnvironment("local");

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
    env: localEnv,
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

async function up() {
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
    throw new Error("Finish bun run setup before saving a complete catalog snapshot.");
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
      await run(["bun", "--no-env-file", "../../scripts/run.ts", "db:push"], {
        cwd: join(root, "packages/db"),
      });
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
            "Bootstrapping the complete Kitsu catalog. This can take hours; rerun bun run setup to resume.",
          );
          await run(["bun", "--no-env-file", "scripts/sync-bootstrap.ts", "--resume"], {
            cwd: join(root, "apps/api"),
          });
        }
      } else {
        console.log(
          "Existing completed catalog preserved. Run catalog:sync when you want fresh data.",
        );
      }
      await saveSnapshot();
      console.log("Local setup is ready. Start the app with bun run dev.");
    } else if (command === "sync") {
      if (!(await complete()))
        throw new Error("Run bun run setup to finish the first full catalog crawl.");
      await run(["bun", "--no-env-file", "scripts/sync-bootstrap.ts", "--incremental"], {
        cwd: join(root, "apps/api"),
      });
      console.log("Local catalog refreshed. Run catalog:snapshot to update your saved snapshot.");
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
