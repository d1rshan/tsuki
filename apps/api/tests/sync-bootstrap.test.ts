import { afterEach, beforeEach, expect, test, vi } from "vitest";

const sync = vi.hoisted(() => ({
  getSyncStates: vi.fn(),
  resetSync: vi.fn(),
  runSyncTick: vi.fn(),
}));

vi.mock("../src/modules/sync/service", () => sync);

const originalArgs = process.argv;

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  vi.spyOn(console, "log").mockImplementation(() => {});
  sync.getSyncStates.mockResolvedValue([]);
  sync.runSyncTick.mockResolvedValue({ done: true, status: "idle", upserted: 20 });
});

afterEach(() => {
  process.argv = originalArgs;
  vi.restoreAllMocks();
});

test("resuming a full crawl skips completed anime and continues unfinished manga", async () => {
  process.argv = ["bun", "sync-bootstrap.ts", "--resume"];
  sync.getSyncStates.mockResolvedValue([
    { id: "ANIME", status: "idle", cursor: null, lastCompletedAt: new Date() },
    { id: "MANGA", status: "failed", cursor: { offset: 40 } },
  ]);

  await import("../scripts/sync-bootstrap");

  expect(sync.resetSync).not.toHaveBeenCalled();
  expect(sync.runSyncTick.mock.calls).toEqual([["MANGA", { force: true, incremental: false }]]);
});

test("incremental refresh keeps saved cursors and uses delta mode for both types", async () => {
  process.argv = ["bun", "sync-bootstrap.ts", "--incremental"];
  sync.getSyncStates.mockResolvedValue([
    { id: "ANIME", status: "failed", cursor: { offset: 40 } },
    { id: "MANGA", status: "idle", cursor: null, lastCompletedAt: new Date() },
  ]);

  await import("../scripts/sync-bootstrap");

  expect(sync.resetSync).not.toHaveBeenCalled();
  expect(sync.runSyncTick.mock.calls).toEqual([
    ["ANIME", { force: true, incremental: true }],
    ["MANGA", { force: true, incremental: true }],
  ]);
});

test("an explicitly fresh full crawl resets both cursors", async () => {
  process.argv = ["bun", "sync-bootstrap.ts"];

  await import("../scripts/sync-bootstrap");

  expect(sync.resetSync.mock.calls).toEqual([["ANIME"], ["MANGA"]]);
});
