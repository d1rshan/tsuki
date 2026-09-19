import { Elysia, t, status } from "elysia";

import { auth } from "@tsuki/auth/server";
import { env } from "@tsuki/env/api";

import { authPlugin } from "../../plugins/auth";
import { ErrorModel } from "../../plugins/errors";
import { getSyncStates, resetSync, runSyncTick } from "./service";
import { SyncMediaTypeBody, SyncStateModel, SyncTickModel } from "./model";

const ADMIN_ROLES = new Set(["admin", "owner"]);

/** Better Auth's admin plugin: role is a plain string ("admin", "owner"). */
const isAdmin = (role: string | null | undefined) => !!role && ADMIN_ROLES.has(role);

/**
 * The tick accepts either the shared secret (cron / scripted callers) or an
 * admin/owner session (manual triggers from the dashboard). Returns undefined
 * to let the request through; a returned `status()` short-circuits it.
 */
async function requireSyncAuth({
  headers,
  request,
}: {
  headers: Record<string, string | undefined>;
  request: Request;
}) {
  if (env.SYNC_SECRET && headers["x-sync-secret"] === env.SYNC_SECRET) return;

  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return status(401, { error: "Unauthorized" });
  if (!isAdmin(session.user.role)) return status(403, { error: "Forbidden" });
}

/** Status/reset are admin-only, no secret shortcut. */
async function requireAdmin(user: { role?: string | null } | null | undefined) {
  if (!isAdmin(user?.role)) return status(403, { error: "Forbidden" });
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
      const anime = await runSyncTick("ANIME");
      const manga = await runSyncTick("MANGA");
      return { anime, manga };
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
          "Vercel cron (Authorization: Bearer $CRON_SECRET, set CRON_SECRET = SYNC_SECRET) ticks anime then manga.",
      },
    },
  );
