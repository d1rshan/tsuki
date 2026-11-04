import { join } from "node:path";

import {
  assertNoLegacyEnvFiles,
  describeDatabase,
  ensureLocalEnvironment,
  loadEnvironment,
  root,
} from "./environment";

const commands = [
  "setup",
  "dev",
  "dev:mobile",
  "build",
  "start",
  "env:check",
  "env:check:prod",
  "local:up",
  "local:stop",
  "catalog:sync",
  "catalog:snapshot",
  "db:push",
  "db:push:prod",
  "db:studio",
  "db:studio:prod",
  "db:cleanup-activity",
  "db:cleanup-activity:prod",
];
const command = process.argv[2] ?? "";
const dryRun = process.argv.includes("--dry-run");

async function main() {
  if (!commands.includes(command))
    throw new Error(`Usage: bun run scripts/run.ts <${commands.join(" | ")}> [--dry-run]`);
  assertNoLegacyEnvFiles();
  const production = command.endsWith(":prod");
  if (!production && !dryRun && ["setup", "local:up", "dev", "dev:mobile"].includes(command))
    ensureLocalEnvironment();
  let appUrl: string | undefined;
  if (command === "dev:mobile") {
    const child = Bun.spawn(["tailscale", "ip", "-4"], { stdout: "pipe", stderr: "inherit" });
    const ip = (await new Response(child.stdout).text()).trim();
    if ((await child.exited) !== 0 || !/^\d{1,3}(\.\d{1,3}){3}$/.test(ip))
      throw new Error("Connect Tailscale and ensure `tailscale ip -4` returns an IPv4 address.");
    appUrl = `http://${ip}:3000`;
  }
  const env = loadEnvironment(production ? "production" : "local", { appUrl });
  if (["build", "start"].includes(command)) env.NODE_ENV = "production";
  console.log(`Environment: ${production ? "production (Neon)" : "local (Docker)"}`);
  console.log(`Database: ${describeDatabase(env)}`);
  if (!production) console.log(`App: ${env.NEXT_PUBLIC_APP_URL}`);
  if (command.startsWith("env:check")) return;

  async function run(args: string[], cwd = root) {
    if (dryRun) {
      console.log(`Would run: ${args.join(" ")} (cwd: ${cwd})`);
      return;
    }
    const child = Bun.spawn(args, {
      cwd,
      env,
      stdin: "inherit",
      stdout: "inherit",
      stderr: "inherit",
    });
    const interrupt = () => child.kill("SIGTERM");
    const terminate = () => child.kill("SIGTERM");
    process.once("SIGINT", interrupt);
    process.once("SIGTERM", terminate);
    try {
      const status = await child.exited;
      if (status !== 0) throw new Error(`Command failed (${status}): ${args.join(" ")}`);
    } finally {
      process.off("SIGINT", interrupt);
      process.off("SIGTERM", terminate);
    }
  }
  const local = (action: string) => run(["bun", "--no-env-file", "scripts/local.ts", action]);
  if (command === "setup") return local("setup");
  if (command === "local:up") return local("up");
  if (command === "local:stop") return local("stop");
  if (command === "catalog:sync") return local("sync");
  if (command === "catalog:snapshot") return local("snapshot");
  if (command === "dev" || command === "dev:mobile") {
    await local("up");
    return run(["node", join(root, "node_modules/.bin/turbo"), "run", "dev"]);
  }
  if (command === "build") {
    await local("up");
    const args = ["node", join(root, "node_modules/.bin/turbo"), "run", "build"];
    const apiArgs = ["bun", "--no-env-file", "src/index.ts"];
    const apiDirectory = join(root, "apps/api");
    if (dryRun) {
      console.log("Build needs the local API for prerendering; starts it temporarily if absent.");
      await run(apiArgs, apiDirectory);
      return run(args);
    }
    const ready = async () => {
      try {
        const response = await fetch("http://localhost:3001/", {
          signal: AbortSignal.timeout(1000),
        });
        return response.ok && (await response.text()) === "Tsuki API Running!";
      } catch {
        return false;
      }
    };
    if (await ready()) return run(args);
    console.log("Starting temporary local API for prerendering...");
    const api = Bun.spawn(apiArgs, {
      cwd: apiDirectory,
      env,
      stdout: "inherit",
      stderr: "inherit",
    });
    const stop = () => api.kill("SIGTERM");
    process.once("SIGINT", stop);
    process.once("SIGTERM", stop);
    try {
      let available = false;
      for (let attempt = 0; attempt < 50; attempt++) {
        if (api.exitCode !== null)
          throw new Error(
            "Temporary API exited before becoming ready. Check port 3001 and the local database.",
          );
        if (await ready()) {
          available = true;
          break;
        }
        await Bun.sleep(200);
      }
      if (!available) throw new Error("Local API did not become ready for prerendering.");
      await run(args);
    } finally {
      stop();
      await api.exited;
      process.off("SIGINT", stop);
      process.off("SIGTERM", stop);
    }
    return;
  }
  if (command === "start")
    return run(["node", join(root, "node_modules/.bin/turbo"), "run", "start"]);

  const db = join(root, "packages/db");
  if (command.startsWith("db:push")) {
    await run(["bun", "--no-env-file", "src/search-index.ts"], db);
    await run(["bun", "--no-env-file", "node_modules/drizzle-kit/bin.cjs", "push"], db);
    return run(["bun", "--no-env-file", "src/triggers.ts"], db);
  }
  if (command.startsWith("db:studio"))
    return run(["bun", "--no-env-file", "node_modules/drizzle-kit/bin.cjs", "studio"], db);
  return run(["bun", "--no-env-file", "src/cleanup-activity.ts"], db);
}

try {
  await main();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
