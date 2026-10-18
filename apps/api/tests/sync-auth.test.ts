import { beforeEach, describe, expect, test, vi } from "vitest";
import { Elysia } from "elysia";

const getSession = vi.fn();
const mockEnv = { SYNC_SECRET: "sekrit" };

vi.mock("@tsuki/env/api", () => ({ env: mockEnv }));

vi.mock("@tsuki/auth/server", () => ({
  auth: { api: { getSession: (...args: unknown[]) => getSession(...args) } },
}));

// Stub the plugin mount — requireSyncAuth talks to `auth` directly.
vi.mock("../src/plugins/auth", () => ({
  authPlugin: new Elysia({ name: "better-auth" }),
}));

vi.mock("@tsuki/db", () => ({
  db: {},
  mediaDal: {},
  syncState: {},
  MEDIA_TYPES: ["ANIME", "MANGA"],
  MEDIA_FORMATS: ["TV", "MOVIE"],
  MEDIA_STATUSES: ["FINISHED", "RELEASING"],
}));
vi.mock("@tsuki/kitsu", async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  kitsuPage: vi.fn(),
  toMediaRow: (x: unknown) => x,
}));

const { requireSyncAuth } = await import("../src/modules/sync/index");

const adminSession = { user: { role: "admin" } };
const headers = (extra: Record<string, string> = {}) => ({ ...extra });
const request = (extra: Record<string, string> = {}) =>
  new Request("http://localhost/admin/sync/tick-cron", { headers: extra });

/** undefined = let the request through; anything else = a short-circuit status. */
const denied = (value: unknown) => value !== undefined;

beforeEach(() => {
  mockEnv.SYNC_SECRET = "sekrit";
  getSession.mockReset();
  getSession.mockResolvedValue(null);
});

describe("requireSyncAuth", () => {
  test("the shared secret passes as x-sync-secret", async () => {
    expect(
      await requireSyncAuth({
        headers: headers({ "x-sync-secret": "sekrit" }),
        request: request(),
      }),
    ).toBeUndefined();
  });

  test("Vercel cron's Bearer CRON_SECRET (= SYNC_SECRET) passes", async () => {
    const h = headers({ authorization: "Bearer sekrit" });
    expect(
      await requireSyncAuth({ headers: h, request: request({ authorization: "Bearer sekrit" }) }),
    ).toBeUndefined();
    expect(getSession).not.toHaveBeenCalled();
  });

  test("a wrong secret falls through to the session check", async () => {
    const h = headers({ authorization: "Bearer wrong" });
    expect(
      denied(
        await requireSyncAuth({ headers: h, request: request({ authorization: "Bearer wrong" }) }),
      ),
    ).toBe(true);
  });

  test("no credentials and no session is 401", async () => {
    expect(denied(await requireSyncAuth({ headers: headers(), request: request() }))).toBe(true);
  });

  test("an admin session passes without any secret", async () => {
    getSession.mockResolvedValue(adminSession);
    expect(await requireSyncAuth({ headers: headers(), request: request() })).toBeUndefined();
  });

  test("a non-admin session is 403", async () => {
    getSession.mockResolvedValue({ user: { role: "member" } });
    expect(denied(await requireSyncAuth({ headers: headers(), request: request() }))).toBe(true);
  });

  test("an unset secret never authenticates, not even with an empty bearer", async () => {
    mockEnv.SYNC_SECRET = "";
    const h = headers({ authorization: "Bearer " });
    expect(
      denied(await requireSyncAuth({ headers: h, request: request({ authorization: "Bearer " }) })),
    ).toBe(true);
    // cron without SYNC_SECRET configured must rely on its session — none → 401
    expect(getSession).toHaveBeenCalled();
  });
});
