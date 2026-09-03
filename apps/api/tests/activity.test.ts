import { describe, expect, test } from "vitest";

import { encodeActivityCursor, parseActivityCursor } from "../src/modules/activity/service";
import { logSnapshot, logSourceId } from "../src/modules/library/service";
import { reviewSnapshot } from "../src/modules/reviews/service";

describe("log sourceId day key", () => {
  test("keys by UTC calendar day, not local time", () => {
    // 2026-01-01 23:30 UTC is a different local day in UTC+2, still one key.
    expect(logSourceId(42, new Date("2026-01-01T23:30:00Z"))).toBe("42:2026-01-01");
    expect(logSourceId(42, new Date("2026-01-01T00:00:00+02:00"))).toBe("42:2025-12-31");
  });

  test("a new UTC day yields a new sourceId", () => {
    expect(logSourceId(42, new Date("2026-01-01T23:59:59Z"))).not.toBe(
      logSourceId(42, new Date("2026-01-02T00:00:00Z")),
    );
  });

  test("different media never share a key on the same day", () => {
    const at = new Date("2026-03-10T12:00:00Z");
    expect(logSourceId(1, at)).not.toBe(logSourceId(10, at));
  });
});

describe("activity cursor codec", () => {
  test("round-trips occurredAt and id", () => {
    const cursor = { occurredAt: new Date("2026-06-15T10:30:00.123Z"), id: "abc-123" };
    const parsed = parseActivityCursor(encodeActivityCursor(cursor));
    expect(parsed).toEqual(cursor);
  });

  test("encodes null as null", () => {
    expect(encodeActivityCursor(null)).toBeNull();
  });

  test("reads unparseable cursors as 'start from the top'", () => {
    expect(parseActivityCursor(null)).toBeUndefined();
    expect(parseActivityCursor("")).toBeUndefined();
    expect(parseActivityCursor("not-a-date|some-id")).toBeUndefined();
    expect(parseActivityCursor("no-separator")).toBeUndefined();
    expect(parseActivityCursor("2026-06-15T10:30:00Z|")).toBeUndefined();
  });
});

describe("snapshot builders", () => {
  const entry = (overrides: Partial<Parameters<typeof logSnapshot>[0]> = {}) => ({
    status: "CURRENT" as const,
    score: null,
    progress: 12,
    progressVolumes: null,
    repeat: 0,
    ...overrides,
  });
  const today = "42:2026-03-10";

  test("log snapshot copies the entry's viewer-facing state", () => {
    expect(logSnapshot(entry({ score: 8 }), [], today)).toEqual({
      status: "CURRENT",
      score: 8,
      progress: 12,
      progressVolumes: null,
      repeat: 0,
    });
  });

  test("first-ever log states no range", () => {
    expect(logSnapshot(entry({ progress: 12 }), [], today)).not.toHaveProperty("progressFrom");
  });

  test("a new day chains where the last logged day closed (13–15 after 12)", () => {
    const priors = [{ sourceId: "42:2026-03-09", snapshot: { progress: 12 } }];
    expect(logSnapshot(entry({ progress: 15 }), priors, today)).toEqual({
      status: "CURRENT",
      score: null,
      progress: 15,
      progressVolumes: null,
      repeat: 0,
      progressFrom: 12,
    });
  });

  test("same-day re-upserts extend progress but keep the day's original baseline", () => {
    const priors = [
      { sourceId: today, snapshot: { progress: 5, progressFrom: 4 } },
      { sourceId: "42:2026-03-09", snapshot: { progress: 4 } },
    ];
    expect(logSnapshot(entry({ progress: 12 }), priors, today)).toMatchObject({
      progress: 12,
      progressFrom: 4,
    });
  });

  test("a same-day progress save derives the range the day's first save never stored", () => {
    // today opened with a score-only save; the later progress save can still
    // state the day's true range against yesterday's close
    const priors = [
      { sourceId: today, snapshot: { score: 8 } },
      { sourceId: "42:2026-03-09", snapshot: { progress: 12 } },
    ];
    expect(logSnapshot(entry({ progress: 15 }), priors, today)).toMatchObject({
      progress: 15,
      progressFrom: 12,
    });
  });

  test("a same-day save with no prior baseline states no range", () => {
    const priors = [{ sourceId: today, snapshot: { score: 8 } }];
    expect(logSnapshot(entry({ progress: 12 }), priors, today)).not.toHaveProperty("progressFrom");
  });

  test("a same-day save after a downward correction states no range", () => {
    const priors = [
      { sourceId: today, snapshot: { progress: 10 } },
      { sourceId: "42:2026-03-09", snapshot: { progress: 15 } },
    ];
    expect(logSnapshot(entry({ progress: 10 }), priors, today)).not.toHaveProperty("progressFrom");
  });

  test("a same-day volume save derives the volume baseline", () => {
    const priors = [
      { sourceId: today, snapshot: { progressVolumes: 2 } },
      { sourceId: "42:2026-03-09", snapshot: { progress: 12, progressVolumes: 2 } },
    ];
    expect(logSnapshot(entry({ progress: 12, progressVolumes: 4 }), priors, today)).toMatchObject({
      progressVolumes: 4,
      progressVolumesFrom: 2,
    });
  });

  test("a downward correction states no range", () => {
    const priors = [{ sourceId: "42:2026-03-09", snapshot: { progress: 15 } }];
    expect(logSnapshot(entry({ progress: 10 }), priors, today)).not.toHaveProperty("progressFrom");
  });

  test("a day whose save had no progress is skipped as a baseline", () => {
    const priors = [
      { sourceId: "42:2026-03-09", snapshot: { score: 8 } },
      { sourceId: "42:2026-03-08", snapshot: { progress: 12 } },
    ];
    expect(logSnapshot(entry({ progress: 15 }), priors, today)).toMatchObject({
      progressFrom: 12,
    });
  });

  test("a score-only day drops progress, so its card reads 'rated'", () => {
    const priors = [{ sourceId: "42:2026-03-09", snapshot: { progress: 12 } }];
    expect(logSnapshot(entry({ progress: 12, score: 8 }), priors, today)).not.toHaveProperty(
      "progress",
    );
  });

  test("same-day score-only saves keep the progress the day already earned", () => {
    const priors = [{ sourceId: today, snapshot: { progress: 12, progressFrom: 4 } }];
    expect(logSnapshot(entry({ progress: 12, score: 8 }), priors, today)).toMatchObject({
      progress: 12,
      progressFrom: 4,
    });
  });

  test("volumes chain their own baseline (3–4 of after 2)", () => {
    const priors = [{ sourceId: "42:2026-03-09", snapshot: { progress: 12, progressVolumes: 2 } }];
    expect(logSnapshot(entry({ progress: 12, progressVolumes: 4 }), priors, today)).toMatchObject({
      progressVolumesFrom: 2,
    });
  });

  test("a volume-only day states volumes but no chapter progress", () => {
    const priors = [{ sourceId: "42:2026-03-09", snapshot: { progress: 12, progressVolumes: 2 } }];
    const snapshot = logSnapshot(entry({ progress: 12, progressVolumes: 4 }), priors, today);
    expect(snapshot).toMatchObject({ progressVolumes: 4, progressVolumesFrom: 2 });
    expect(snapshot).not.toHaveProperty("progress");
  });

  test("review snapshot carries the full content document", () => {
    const content = { type: "doc", content: [] } as never;
    expect(reviewSnapshot({ content })).toEqual({ content });
  });
});
