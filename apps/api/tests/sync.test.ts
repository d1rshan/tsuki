import { beforeEach, describe, expect, test, vi } from "vitest";

const fetchPage = vi.fn();
const upsert = vi.fn();
const states = new Map<string, Record<string, unknown>>();

vi.mock("drizzle-orm", () => ({
  // Inert stand-in: the fake db reads the value straight off the "where".
  eq: (column: unknown, value: unknown) => ({ column, value }),
}));

vi.mock("@tsuki/db", () => ({
  db: {
    query: {
      syncState: {
        findFirst: async ({ where }: { where: { value: string } }) => states.get(where.value),
      },
    },
    insert: () => ({
      values: (values: { id: string }) => ({
        onConflictDoUpdate: async ({ set }: { set: Record<string, unknown> }) => {
          states.set(values.id, { ...states.get(values.id), ...values, ...set });
        },
      }),
    }),
    select: () => ({ from: async () => [...states.values()] }),
  },
  mediaDal: { upsertMedia: (...args: unknown[]) => upsert(...args) },
  syncState: { id: { name: "id" } },
}));

vi.mock("@tsuki/kitsu", () => ({
  kitsuPage: (...args: unknown[]) => fetchPage(...args),
  toMediaRow: ({ id }: { id: string }) => ({ id: Number(id) }),
}));

const { runSyncTick, resetSync } = await import("../src/modules/sync/service");

const fullPage = (offset: number, count = 20) => ({
  data: Array.from({ length: count }, (_, i) => ({ id: String(offset + i) })),
  meta: { count: 40 },
});

const at = (minutesAgo: number) => new Date(Date.now() - minutesAgo * 60_000);

beforeEach(() => {
  states.clear();
  fetchPage.mockReset();
  upsert.mockReset();
});

describe("runSyncTick", () => {
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
