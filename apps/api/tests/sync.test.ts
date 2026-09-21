import { beforeEach, describe, expect, test, vi } from "vitest";

const fetchPage = vi.fn();
const fetchRecentPage = vi.fn();
const upsert = vi.fn();
const states = new Map<string, Record<string, unknown>>();
/** db.execute's readWatermark fixture: media table's max(updated_at) per type (ms). */
const dbWatermarks: Record<string, number> = {};

/** Where-condition builders + evaluator, mirroring the drizzle-orm shapes the
 * service builds via @tsuki/db's re-exports. */
const evalWhere = (row: Record<string, unknown>, cond: unknown): boolean => {
  const c = cond as { any?: unknown[]; all?: unknown[]; op?: string; col?: string; v?: unknown };
  if (c.any) return c.any.some((inner) => evalWhere(row, inner));
  if (c.all) return c.all.every((inner) => evalWhere(row, inner));
  if (c.op === "eq") return row[c.col!] === c.v;
  if (c.op === "ne") return row[c.col!] !== c.v;
  if (c.op === "isNull") return row[c.col!] == null;
  if (c.op === "lt") return (row[c.col!] as number) < (c.v as number);
  return false;
};

vi.mock("@tsuki/db", () => {
  const builders = {
    eq: (c: { name: string }, v: unknown) => ({ op: "eq", col: c.name, v }),
    ne: (c: { name: string }, v: unknown) => ({ op: "ne", col: c.name, v }),
    isNull: (c: { name: string }) => ({ op: "isNull", col: c.name }),
    lt: (c: { name: string }, v: unknown) => ({ op: "lt", col: c.name, v }),
    or: (...any: unknown[]) => ({ any }),
  };
  return {
    ...builders,
    db: {
      insert: () => ({
        values: (values: { id: string }) => ({
          onConflictDoUpdate: ({
            set,
            setWhere,
          }: {
            set: Record<string, unknown>;
            setWhere?: unknown;
          }) => {
            // Awaitable (writeState) AND .returning()-able (claimSync).
            const exec = async () => {
              const existing = states.get(values.id);
              if (!existing) {
                const row = {
                  id: values.id,
                  status: "idle",
                  cursor: null,
                  cursorUpdatedAt: null,
                  runStartedAt: null,
                  lastCompletedAt: null,
                  watermark: null,
                  error: null,
                };
                states.set(values.id, row);
                return [row];
              }
              if (setWhere && !evalWhere(existing, setWhere)) return [];
              const updated = { ...existing, ...set };
              states.set(values.id, updated);
              return [updated];
            };
            const promise = exec();
            return Object.assign(promise, { returning: () => promise });
          },
        }),
      }),
      select: () => ({ from: async () => [...states.values()] }),
      execute: async (query: string) => {
        const type = /type = '([^']+)'/.exec(query)?.[1];
        return { rows: [{ watermark: dbWatermarks[type ?? ""] ?? 0 }] };
      },
    },
    mediaDal: { upsertMedia: (...args: unknown[]) => upsert(...args) },
    syncState: {
      id: { name: "id" },
      status: { name: "status" },
      cursorUpdatedAt: { name: "cursorUpdatedAt" },
    },
  };
});

vi.mock("@tsuki/kitsu", () => ({
  kitsuPage: (...args: unknown[]) => fetchPage(...args),
  kitsuRecentPage: (...args: unknown[]) => fetchRecentPage(...args),
  toMediaRow: ({ id }: { id: string }) => ({ id: Number(id) }),
}));

const { runSyncTick, resetSync, claimSync } = await import("../src/modules/sync/service");

const fullPage = (offset: number, count = 20) => ({
  data: Array.from({ length: count }, (_, i) => ({ id: String(offset + i) })),
  meta: { count: 40 },
});

const at = (minutesAgo: number) => new Date(Date.now() - minutesAgo * 60_000);

beforeEach(() => {
  states.clear();
  for (const key of Object.keys(dbWatermarks)) delete dbWatermarks[key];
  fetchPage.mockReset();
  fetchRecentPage.mockReset();
  upsert.mockReset();
});

describe("runSyncTick — full walk", () => {
  test("fresh start crawls until the collection is exhausted", async () => {
    fetchPage.mockImplementation((type: string, offset: number) => fullPage(offset));

    const result = await runSyncTick("ANIME");

    expect(result).toEqual({ done: true, status: "idle", upserted: 40, nextOffset: null });
    expect(fetchPage.mock.calls.map((call) => call[1])).toEqual([0, 20]);
    expect(upsert).toHaveBeenCalledTimes(2);
    expect(upsert.mock.calls[0]?.[0]).toHaveLength(20);

    const state = states.get("ANIME");
    expect(state?.status).toBe("idle");
    expect(state?.cursor).toBeNull();
    expect(state?.lastCompletedAt).toBeInstanceOf(Date);
  });

  test("resumes from a persisted cursor", async () => {
    states.set("ANIME", {
      id: "ANIME",
      status: "failed",
      cursor: { offset: 20, upserted: 20 },
    });
    fetchPage.mockImplementation((type: string, offset: number) => fullPage(offset));

    const result = await runSyncTick("ANIME");

    expect(fetchPage.mock.calls.map((call) => call[1])).toEqual([20]);
    expect(result).toEqual({ done: true, status: "idle", upserted: 40, nextOffset: null });
  });

  test("an empty page ends the walk when Kitsu reports no meta.count", async () => {
    fetchPage
      .mockImplementationOnce((type: string, offset: number) => fullPage(offset))
      .mockImplementationOnce(() => ({ data: [] }));

    const result = await runSyncTick("MANGA");

    expect(result).toEqual({ done: true, status: "idle", upserted: 20, nextOffset: null });
  });

  test("a live run holds the lock: no fetch, no cursor change", async () => {
    states.set("ANIME", {
      id: "ANIME",
      status: "running",
      cursor: { offset: 60, upserted: 60 },
      cursorUpdatedAt: at(1),
    });

    const result = await runSyncTick("ANIME");

    expect(result).toEqual({ done: false, status: "running", upserted: 0, nextOffset: 60 });
    expect(fetchPage).not.toHaveBeenCalled();
    expect(upsert).not.toHaveBeenCalled();
  });

  test("a stale run is taken over and resumed", async () => {
    states.set("ANIME", {
      id: "ANIME",
      status: "running",
      cursor: { offset: 20, upserted: 20 },
      cursorUpdatedAt: at(6),
    });
    fetchPage.mockImplementation((type: string, offset: number) => fullPage(offset));

    const result = await runSyncTick("ANIME");

    expect(fetchPage.mock.calls.map((call) => call[1])).toEqual([20]);
    expect(result.done).toBe(true);
  });

  test("force bypasses a live claim — the single local writer keeps working", async () => {
    states.set("ANIME", {
      id: "ANIME",
      status: "running",
      cursor: { offset: 60, upserted: 60 },
      cursorUpdatedAt: at(1),
    });
    fetchPage.mockImplementation((type: string, offset: number) => fullPage(offset));

    const result = await runSyncTick("ANIME", { force: true });

    expect(fetchPage.mock.calls.map((call) => call[1])).toEqual([60]);
    expect(result.done).toBe(true);
  });

  test("a failure marks the state failed and keeps the cursor for resume", async () => {
    fetchPage
      .mockImplementationOnce((type: string, offset: number) => fullPage(offset))
      .mockImplementationOnce(() => {
        throw new Error("Kitsu is unreachable");
      });

    await expect(runSyncTick("ANIME")).rejects.toThrow("Kitsu is unreachable");

    const state = states.get("ANIME");
    expect(state?.status).toBe("failed");
    expect(state?.error).toBe("Kitsu is unreachable");
    expect(state?.cursor).toEqual({ offset: 20, upserted: 20 });
  });

  test("stops at the time box and persists the cursor for the next tick", async () => {
    vi.useFakeTimers();
    try {
      fetchPage.mockImplementation((type: string, offset: number) => ({
        data: Array.from({ length: 20 }, (_, i) => ({ id: String(offset + i) })),
      }));

      const promise = runSyncTick("ANIME");
      await vi.advanceTimersByTimeAsync(40_500);
      const result = await promise;

      expect(result.done).toBe(false);
      expect(result.status).toBe("running");
      expect(result.nextOffset).toBeGreaterThan(0);

      const state = states.get("ANIME");
      expect(state?.status).toBe("running");
      expect(state?.cursor).toEqual({ offset: result.nextOffset, upserted: result.upserted });
      expect(fetchPage.mock.calls[0]?.[1]).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });

  test("resetSync clears the cursor and status", async () => {
    states.set("ANIME", {
      id: "ANIME",
      status: "failed",
      cursor: { offset: 100, upserted: 100 },
      error: "boom",
    });

    await resetSync("ANIME");

    const state = states.get("ANIME");
    expect(state?.status).toBe("idle");
    expect(state?.cursor).toBeNull();
    expect(state?.error).toBeNull();
  });
});

describe("claimSync — race semantics", () => {
  test("a second claim inside the grace window is rejected", async () => {
    states.set("ANIME", {
      id: "ANIME",
      status: "running",
      cursorUpdatedAt: at(1),
    });

    expect(await claimSync("ANIME")).toBeNull();
  });

  test("a fresh type is claimed by creating its row", async () => {
    const claimed = await claimSync("MANGA");

    expect(claimed).toMatchObject({ id: "MANGA", status: "idle" });
  });
});

describe("runSyncTick — incremental walk", () => {
  test("stops once a page's oldest row predates the derived watermark", async () => {
    dbWatermarks.ANIME = Date.parse("2026-01-02T00:00:00Z");
    fetchRecentPage.mockImplementationOnce(() => ({
      data: [
        { id: "300", attributes: { updatedAt: "2026-01-03T00:00:00.000Z" } },
        ...Array.from({ length: 18 }, (_, i) => ({
          id: String(301 + i),
          attributes: { updatedAt: "2026-01-02T12:00:00.000Z" },
        })),
        { id: "500", attributes: { updatedAt: "2026-01-01T00:00:00.000Z" } },
      ],
    }));

    const result = await runSyncTick("ANIME", { incremental: true });

    expect(result).toEqual({ done: true, status: "idle", upserted: 20, nextOffset: null });
    expect(fetchRecentPage.mock.calls.map((call) => call[1])).toEqual([0]);
    expect(fetchPage).not.toHaveBeenCalled();

    const state = states.get("ANIME");
    // The walk's newest updatedAt becomes the next pass's boundary.
    expect(state?.watermark).toBe("2026-01-03T00:00:00.000Z");
    expect(state?.cursor).toBeNull();
  });

  test("a resumed pass stops at the stored watermark, not a re-derived one", async () => {
    dbWatermarks.ANIME = Date.parse("2026-02-01T00:00:00Z"); // newer than stored!
    states.set("ANIME", {
      id: "ANIME",
      status: "failed",
      cursor: { offset: 20, upserted: 20 },
      watermark: "2026-01-02T00:00:00.000Z",
    });
    fetchRecentPage.mockImplementationOnce(() => ({
      data: Array.from({ length: 20 }, (_, i) => ({
        id: String(20 + i),
        attributes: { updatedAt: "2026-01-01T00:00:00.000Z" },
      })),
    }));

    const result = await runSyncTick("ANIME", { incremental: true });

    expect(result.done).toBe(true);
    expect(fetchRecentPage.mock.calls.map((call) => call[1])).toEqual([20]);
  });

  test("a page fully newer than the watermark keeps the walk going", async () => {
    dbWatermarks.ANIME = Date.parse("2026-01-01T00:00:00Z");
    fetchRecentPage
      .mockImplementationOnce(() => ({
        data: Array.from({ length: 20 }, (_, i) => ({
          id: String(i),
          attributes: { updatedAt: "2026-01-03T00:00:00.000Z" },
        })),
      }))
      .mockImplementationOnce(() => ({
        data: [
          { id: "20", attributes: { updatedAt: "2026-01-02T00:00:00.000Z" } },
          { id: "21", attributes: { updatedAt: "2025-06-01T00:00:00.000Z" } },
        ],
      }));

    const result = await runSyncTick("ANIME", { incremental: true });

    expect(result.done).toBe(true);
    expect(fetchRecentPage.mock.calls.map((call) => call[1])).toEqual([0, 20]);
    expect(upsert).toHaveBeenCalledTimes(2);
  });

  test("an empty catalogue walks the whole collection (bootstrap fallback)", async () => {
    fetchRecentPage
      .mockImplementationOnce(() => ({
        data: Array.from({ length: 20 }, (_, i) => ({ id: String(i) })),
      }))
      .mockImplementationOnce(() => ({ data: [] }));

    const result = await runSyncTick("ANIME", { incremental: true });

    expect(result).toEqual({ done: true, status: "idle", upserted: 20, nextOffset: null });
  });
});
