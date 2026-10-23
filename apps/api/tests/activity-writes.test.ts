import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getEntry: vi.fn(),
  upsertEntry: vi.fn(),
  getLog: vi.fn(),
  upsertActivity: vi.fn(),
  ensureMedia: vi.fn(),
  getReview: vi.fn(),
  upsertReview: vi.fn(),
  deleteEntry: vi.fn(),
  deleteActivityLogs: vi.fn(),
  deleteReview: vi.fn(),
  deleteActivity: vi.fn(),
}));
vi.mock("@tsuki/db", () => ({
  libraryDal: {
    getEntry: mocks.getEntry,
    upsertEntry: mocks.upsertEntry,
    deleteEntry: mocks.deleteEntry,
  },
  activityDal: {
    getLog: mocks.getLog,
    upsertActivity: mocks.upsertActivity,
    deleteActivityLogs: mocks.deleteActivityLogs,
    deleteActivity: mocks.deleteActivity,
  },
  reviewsDal: {
    getReview: mocks.getReview,
    upsertReview: mocks.upsertReview,
    deleteReview: mocks.deleteReview,
  },
}));
vi.mock("../src/modules/media/service", () => ({ ensureMedia: mocks.ensureMedia }));

import { logMedia, removeEntry } from "../src/modules/library/service";
import { removeReview, submitReview } from "../src/modules/reviews/service";
import { toWire } from "../src/modules/activity/service";

beforeEach(() => {
  vi.resetAllMocks();
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-10-23T12:00:00Z"));
  mocks.ensureMedia.mockResolvedValue({ episodes: 200, chapters: 200 });
});
afterEach(() => vi.useRealTimers());

function libraryState(progress = 199, status: string | null = "CURRENT") {
  let state = {
    progress,
    status,
    score: null,
    repeat: 0,
    progressVolumes: null,
    isFavorite: false,
    notes: null,
  };
  mocks.getEntry.mockImplementation(async () => ({ ...state }));
  mocks.upsertEntry.mockImplementation(async (body) => {
    state = { ...state, ...body };
  });
}

describe("library saves and Activity", () => {
  test.each(["ANIME", "MANGA"] as const)(
    "%s completes authoritatively and records both changes",
    async (type) => {
      libraryState();
      mocks.ensureMedia.mockResolvedValue({
        episodes: type === "ANIME" ? 200 : 1,
        chapters: type === "MANGA" ? 200 : 1,
      });
      const result = await logMedia("actor", type, 42, { progress: 200, status: "REPEATING" });
      expect(result).toMatchObject({ progress: 200, status: "COMPLETED" });
      expect(mocks.upsertActivity).toHaveBeenCalledWith(
        expect.objectContaining({
          sourceId: "42:2026-10-23",
          occurredAt: new Date("2026-10-23T12:00:00Z"),
          snapshot: {
            progressFrom: 199,
            progress: 200,
            statusFrom: "CURRENT",
            status: "COMPLETED",
          },
        }),
      );
    },
  );

  test.each([null, 0, -1])("unknown or nonpositive total %s preserves status", async (total) => {
    libraryState();
    mocks.ensureMedia.mockResolvedValue({ episodes: total, chapters: total });
    expect(await logMedia("actor", "ANIME", 42, { progress: 200 })).toMatchObject({
      status: "CURRENT",
    });
  });

  test("partial save applies completion to existing progress too", async () => {
    libraryState(200);
    expect(await logMedia("actor", "MANGA", 42, { isFavorite: true })).toMatchObject({
      status: "COMPLETED",
      isFavorite: true,
    });
    expect(mocks.upsertActivity).toHaveBeenCalledWith(
      expect.objectContaining({ snapshot: { statusFrom: "CURRENT", status: "COMPLETED" } }),
    );
  });

  test.each([
    {},
    { score: 8 },
    { repeat: 3 },
    { progressVolumes: 10 },
    { isFavorite: true },
    { notes: "memo" },
    { startedAt: { year: 2026, month: null, day: null } },
    { completedAt: { year: 2026, month: null, day: null } },
    { progress: 199 },
    { progress: 100 },
  ])(
    "excluded save %j persists without creating, replacing or retimestamping Activity",
    async (body) => {
      libraryState();
      const today = {
        snapshot: { progressFrom: 190, progress: 199, status: "CURRENT" },
        occurredAt: new Date("2026-10-23T01:00:00Z"),
      };
      mocks.getLog.mockResolvedValue(today);
      await logMedia("actor", "ANIME", 42, body);
      expect(mocks.upsertEntry).toHaveBeenCalledOnce();
      expect(mocks.upsertActivity).not.toHaveBeenCalled();
      expect(today.occurredAt.toISOString()).toBe("2026-10-23T01:00:00.000Z");
    },
  );

  test("same-day accumulation, correction reset and new-day baseline use entry state", async () => {
    libraryState(12);
    let today: { snapshot: unknown; sourceId: string } | undefined;
    mocks.getLog.mockImplementation(async (_actor, sourceId) =>
      today?.sourceId === sourceId ? today : undefined,
    );
    mocks.upsertActivity.mockImplementation(async (row) => {
      today = row;
    });
    await logMedia("actor", "ANIME", 42, { progress: 15 });
    await logMedia("actor", "ANIME", 42, { status: "PAUSED" });
    expect(today?.snapshot).toEqual({
      progressFrom: 12,
      progress: 15,
      statusFrom: "CURRENT",
      status: "PAUSED",
    });
    const writes = mocks.upsertActivity.mock.calls.length;
    await logMedia("actor", "ANIME", 42, { progress: 5 });
    expect(mocks.upsertActivity).toHaveBeenCalledTimes(writes);
    await logMedia("actor", "ANIME", 42, { progress: 8 });
    expect(today?.snapshot).toEqual({
      progressFrom: 5,
      progress: 8,
      statusFrom: "CURRENT",
      status: "PAUSED",
    });
    vi.setSystemTime(new Date("2026-10-24T12:00:00Z"));
    await logMedia("actor", "ANIME", 42, { progress: 10 });
    expect(today).toMatchObject({
      sourceId: "42:2026-10-24",
      snapshot: { progressFrom: 8, progress: 10, status: "PAUSED" },
    });
  });
});

test("reviews store identity and original time without copying the body", async () => {
  const content = {
    version: 1 as const,
    doc: {
      type: "doc" as const,
      content: [{ type: "paragraph", content: [{ type: "text", text: "A great show" }] }],
    },
  };
  const createdAt = new Date("2026-01-01T12:00:00Z");
  mocks.getReview.mockResolvedValue({ content, createdAt });
  await submitReview("actor", "ANIME", 42, { content });
  await submitReview("actor", "ANIME", 42, { content });
  expect(mocks.upsertActivity).toHaveBeenLastCalledWith({
    actorId: "actor",
    type: "REVIEW",
    sourceId: "42",
    mediaId: 42,
    mediaType: "ANIME",
    snapshot: {},
    occurredAt: createdAt,
  });
});

test("Activity serialization allowlists fields even for legacy snapshots", () => {
  const row = {
    type: "LOG",
    snapshot: {
      status: "CURRENT",
      progress: 15,
      progressFrom: 12,
      score: 9,
      repeat: 2,
      progressVolumes: 5,
      content: { secret: "review" },
      contentHtml: "<p>review</p>",
    },
  };
  const wire = toWire([row, { ...row, type: "REVIEW" }] as never);
  expect(wire[0]?.snapshot).toEqual({ status: "CURRENT", progress: 15, progressFrom: 12 });
  expect(wire[1]?.snapshot).toEqual({});
  expect(JSON.stringify(wire)).not.toContain("review");
});

test("deleting sources deletes their Activity", async () => {
  await removeEntry("actor", 42);
  await removeReview("actor", 42);
  expect(mocks.deleteEntry).toHaveBeenCalledWith("actor", 42);
  expect(mocks.deleteActivityLogs).toHaveBeenCalledWith("actor", 42);
  expect(mocks.deleteReview).toHaveBeenCalledWith("actor", 42);
  expect(mocks.deleteActivity).toHaveBeenCalledWith("actor", "REVIEW", "42");
});
