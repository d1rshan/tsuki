import { Elysia, t, status } from "elysia";

import { auth } from "@tsuki/auth/server";
import { env } from "@tsuki/env/api";

import { authPlugin } from "../../plugins/auth";
import { ErrorModel } from "../../plugins/errors";
import { claimSync, getSyncStates, resetSync, runSyncTick, type TickResult } from "./service";
import { SyncMediaTypeBody, SyncStateModel, SyncTickModel } from "./model";
import type { MediaType } from "../media/model";

const ADMIN_ROLES = new Set(["admin", "owner"]);

/** Better Auth's admin plugin: role is a plain string ("admin", "owner"). */
const isAdmin = (role: string | null | undefined) => !!role && ADMIN_ROLES.has(role);

/**
 * The tick accepts either the shared secret (cron / scripted callers) or an
 * admin/owner session (manual triggers from the dashboard). Vercel cron sends
 * `Authorization: Bearer $CRON_SECRET` — CRON_SECRET is set to SYNC_SECRET's
 * value, so the bearer token is the same shared secret. Returns undefined to
 * let the request through; a returned `status()` short-circuits it.
 */
/** Exported for tests; everything else routes through the guards below. */
export async function requireSyncAuth({
  headers,
  request,
}: {
  headers: Record<string, string | undefined>;
  request: Request;
}) {
  const secret = env.SYNC_SECRET;
  if (secret) {
    // An unset (empty) secret never authenticates — the branch is skipped.
    const bearer = /^Bearer (.+)$/.exec(headers.authorization ?? "")?.[1];
    if (headers["x-sync-secret"] === secret || bearer === secret) return;
  }

  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return status(401, { error: "Unauthorized" });
  if (!isAdmin(session.user.role)) return status(403, { error: "Forbidden" });
}

/** Status/reset are admin-only, no secret shortcut. */
async function requireAdmin(user: { role?: string | null } | null | undefined) {
  if (!isAdmin(user?.role)) return status(403, { error: "Forbidden" });
}

/**
 * One nightly pass over a type: claim it, then run incremental 40s ticks back
 * to back until the pass completes or the cron budget runs out. An incomplete
 * pass resumes tomorrow via the cursor and watermark. The budget must fit the
 * hosting platform's function-duration limit — on serverless hosts, set
 * SYNC_CRON_BUDGET_MS (and the platform's maxDuration) accordingly.
 */
const CRON_BUDGET_MS = Number(env.SYNC_CRON_BUDGET_MS) || 4 * 60_000;

async function cronPass(mediaType: MediaType, deadline: number) {
  if (Date.now() >= deadline) {
    return { done: false, status: "running", upserted: 0, nextOffset: null } as TickResult;
  }
  if (!(await claimSync(mediaType))) {
    const current = (await getSyncStates()).find((row) => row.id === mediaType);
    return {
      done: false,
      status: "running",
      upserted: 0,
      nextOffset: current?.cursor?.offset ?? 0,
    } as TickResult;
  }

  // Claimed: single local writer for the rest of the invocation.
  let result = await runSyncTick(mediaType, { force: true, incremental: true });
  while (!result.done && Date.now() < deadline) {
    result = await runSyncTick(mediaType, { force: true, incremental: true });
  }
  return result;
}

export const syncRoutes = new Elysia({ prefix: "/admin/sync", tags: ["Sync"] })
  .use(authPlugin)
  .get(
    "/status",
    async ({ user }) => {
      const denied = await requireAdmin(user);
      if (denied) return denied;

      return getSyncStates();
    },
    {
      auth: true,
      response: { 200: t.Array(SyncStateModel), 401: ErrorModel, 403: ErrorModel },
      detail: { summary: "Catalogue sync status", description: "All sync_state rows." },
    },
  )
  .post(
    "/reset",
    async ({ body: { mediaType }, user }) => {
      const denied = await requireAdmin(user);
      if (denied) return denied;

      await resetSync(mediaType);
      return { ok: true };
    },
    {
      auth: true,
      body: SyncMediaTypeBody,
      response: { 200: t.Object({ ok: t.Boolean() }), 401: ErrorModel, 403: ErrorModel },
      detail: {
        summary: "Reset catalogue sync",
        description: "Clears the cursor so the next tick starts a fresh full crawl.",
      },
    },
  )
  .post("/tick", async ({ body: { mediaType } }) => runSyncTick(mediaType), {
    beforeHandle: ({ headers, request }) => requireSyncAuth({ headers, request }),
    body: SyncMediaTypeBody,
    response: { 200: SyncTickModel, 401: ErrorModel, 403: ErrorModel, 502: ErrorModel },
    detail: {
      summary: "Run one catalogue sync tick",
      description:
        "Crawls Kitsu for ~40s or until the collection is exhausted, persisting the cursor.",
    },
  })
  .get(
    "/tick-cron",
    async () => {
      const deadline = Date.now() + CRON_BUDGET_MS;
      // Each type gets its own budget slice — one type's Kitsu failure must
      // not consume the other's nightly pass. Failures surface per-type.
      const runType = async (type: MediaType): Promise<TickResult> => {
        try {
          return await cronPass(type, deadline);
        } catch (error) {
          return {
            done: false,
            status: "failed",
            upserted: 0,
            nextOffset: null,
            error: error instanceof Error ? error.message : String(error),
          };
        }
      };
      return { anime: await runType("ANIME"), manga: await runType("MANGA") };
    },
    {
      beforeHandle: ({ headers, request }) => requireSyncAuth({ headers, request }),
      response: {
        200: t.Object({ anime: SyncTickModel, manga: SyncTickModel }),
        401: ErrorModel,
        403: ErrorModel,
        502: ErrorModel,
      },
      detail: {
        summary: "Cron entrypoint",
        description:
          "Vercel cron (Authorization: Bearer $CRON_SECRET, set CRON_SECRET = SYNC_SECRET) runs the incremental nightly pass: it claims each type and ticks it until done or the ~4min budget is spent.",
      },
    },
  );
