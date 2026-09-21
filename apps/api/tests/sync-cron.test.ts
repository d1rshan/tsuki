import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { Elysia } from "elysia";

const runSyncTick = vi.fn();
const claimSync = vi.fn();

vi.mock("../src/modules/sync/service", () => ({
  claimSync: (...args: unknown[]) => claimSync(...args),
  getSyncStates: async () => [],
  resetSync: async () => {},
  runSyncTick: (...args: unknown[]) => runSyncTick(...args),
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

vi.mock("@tsuki/env/api", () => ({ env: { SYNC_SECRET: "sekrit" } }));
vi.mock("@tsuki/auth/server", () => ({
  auth: { api: { getSession: async () => null } },
}));
// Stub the plugin mount — the cron route only needs its guard's secret path.
vi.mock("../src/plugins/auth", () => ({
  authPlugin: new Elysia({ name: "better-auth" }),
}));

const { syncRoutes } = await import("../src/modules/sync");
const app = new Elysia().use(syncRoutes);

/** The cron's own credentials: Bearer CRON_SECRET (= SYNC_SECRET). */
const cronRequest = () =>
  new Request("http://localhost/admin/sync/tick-cron", {
    headers: { authorization: "Bearer sekrit" },
  });

const done = { done: true, status: "idle", upserted: 4, nextOffset: null };

beforeEach(() => {
  runSyncTick.mockReset();
  claimSync.mockReset();
  claimSync.mockResolvedValue({ id: "X", status: "idle" });
});

afterEach(() => vi.useRealTimers());

describe("GET /admin/sync/tick-cron", () => {
  test("re-ticks a type until its incremental pass completes", async () => {
    let animeTicks = 0;
    runSyncTick.mockImplementation((mediaType: string) => {
      if (mediaType !== "ANIME") return Promise.resolve(done);
      animeTicks++;
      return Promise.resolve(
        animeTicks >= 3
          ? done
          : {
              done: false,
              status: "running",
              upserted: animeTicks * 20,
              nextOffset: animeTicks * 20,
            },
      );
    });

    const res = await app.handle(cronRequest());
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.anime.done).toBe(true);
    expect(body.manga.done).toBe(true);
    // ANIME needed 3 ticks (2 continuations), MANGA finished on its first.
    expect(runSyncTick.mock.calls.filter((call) => call[0] === "ANIME")).toHaveLength(3);
    expect(runSyncTick.mock.calls.filter((call) => call[0] === "MANGA")).toHaveLength(1);
    // One claim per type, taken up front; continuations ride the held claim.
    expect(claimSync).toHaveBeenCalledTimes(2);
  });

  test("the ~4min budget stops an unfinishable pass; the cursor resumes tomorrow", async () => {
    vi.useFakeTimers();
    // Each tick burns 40s of (fake) time, like the real one does.
    runSyncTick.mockImplementation((_mediaType: string) =>
      Promise.resolve({ done: false, status: "running", upserted: 20, nextOffset: 20 }).then(
        async (result) => {
          await new Promise((resolve) => setTimeout(resolve, 40_000));
          return result;
        },
      ),
    );

    const promise = app.handle(cronRequest());
    await vi.advanceTimersByTimeAsync(5 * 60_000);
    const res = await promise;
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.anime.done).toBe(false);
    expect(body.manga.done).toBe(false);
    // ANIME ticked back to back inside the budget; MANGA never started.
    expect(runSyncTick.mock.calls.filter((call) => call[0] === "ANIME").length).toBeGreaterThan(1);
    expect(runSyncTick.mock.calls.filter((call) => call[0] === "MANGA")).toHaveLength(0);
    expect(claimSync).toHaveBeenCalledTimes(1);
  });

  test("a lost claim returns the holder's cursor instead of crawling", async () => {
    claimSync.mockResolvedValue(null);
    runSyncTick.mockResolvedValue(done);

    const res = await app.handle(cronRequest());
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.anime.done).toBe(false);
    expect(body.manga.done).toBe(false);
    expect(runSyncTick).not.toHaveBeenCalled();
  });
});
