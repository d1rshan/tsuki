import { describe, expect, test } from "vitest";

import { encodeActivityCursor, parseActivityCursor } from "../src/modules/activity/service";
import { completedStatus, logSnapshot, logSourceId } from "../src/modules/library/service";

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

describe("meaningful Log changes", () => {
  const before = { status: "CURRENT" as const, progress: 12 };

  test("progress uses the entry baseline and stores no unrelated fields", () => {
    expect(logSnapshot({ ...before, progress: 15 }, before)).toEqual({
      status: "CURRENT",
      progressFrom: 12,
      progress: 15,
    });
    expect(logSnapshot({ ...before, progress: 15 }, undefined)).toEqual({
      status: "CURRENT",
      statusFrom: null,
      progressFrom: null,
      progress: 15,
    });
  });

  test("a legacy same-day snapshot cannot supply unrelated fields or hide a new increase", () => {
    expect(
      logSnapshot({ ...before, progress: 15 }, before, {
        status: "CURRENT",
        progress: 12,
        score: 9,
        repeat: 2,
        content: { private: "review" },
      } as never),
    ).toEqual({ status: "CURRENT", progressFrom: 12, progress: 15 });
  });

  test("unchanged values and corrections do not replace an existing card", () => {
    const today = { progress: 12, progressFrom: 4, status: "CURRENT" as const };
    expect(logSnapshot(before, before, today)).toBeNull();
    expect(logSnapshot({ ...before, progress: 10 }, before, today)).toBeNull();
    expect(today).toEqual({ progress: 12, progressFrom: 4, status: "CURRENT" });
    expect(logSnapshot({ status: null, progress: 0 }, undefined)).toBeNull();
  });

  test("status-only changes and explicit creation have before/after statuses", () => {
    expect(logSnapshot({ ...before, status: "PAUSED" }, before)).toEqual({
      statusFrom: "CURRENT",
      status: "PAUSED",
    });
    expect(logSnapshot({ status: "PLANNING", progress: 0 }, undefined)).toEqual({
      statusFrom: null,
      status: "PLANNING",
    });
  });

  test("same-day saves retain both opening dimensions, regardless of order", () => {
    const first = logSnapshot({ ...before, progress: 15 }, before)!;
    const second = logSnapshot(
      { status: "PAUSED", progress: 15 },
      { ...before, progress: 15 },
      first,
    )!;
    expect(second).toEqual({
      status: "PAUSED",
      statusFrom: "CURRENT",
      progressFrom: 12,
      progress: 15,
    });
    expect(
      logSnapshot(
        { status: "COMPLETED", progress: 20 },
        { status: "PAUSED", progress: 15 },
        second,
      ),
    ).toEqual({ status: "COMPLETED", statusFrom: "CURRENT", progressFrom: 12, progress: 20 });
    const statusFirst = logSnapshot({ ...before, status: "PAUSED" }, before)!;
    expect(
      logSnapshot({ status: "PAUSED", progress: 15 }, { ...before, status: "PAUSED" }, statusFirst),
    ).toEqual({ status: "PAUSED", statusFrom: "CURRENT", progressFrom: 12, progress: 15 });
  });

  test("increase after correction starts from the corrected entry, not old Activity", () => {
    const today = { status: "CURRENT" as const, progressFrom: 12, progress: 15 };
    expect(logSnapshot({ ...before, progress: 8 }, { ...before, progress: 5 }, today)).toEqual({
      status: "CURRENT",
      progressFrom: 5,
      progress: 8,
    });
    expect(
      logSnapshot({ status: "PAUSED", progress: 5 }, { ...before, progress: 5 }, today),
    ).toMatchObject({ progressFrom: 12, progress: 15, statusFrom: "CURRENT", status: "PAUSED" });
  });

  test("completion requires a positive known total and does not undo Completed", () => {
    expect(completedStatus(200, 200, "CURRENT")).toBe("COMPLETED");
    expect(completedStatus(201, 200, "REPEATING")).toBe("COMPLETED");
    for (const total of [undefined, null, 0, -1]) {
      expect(completedStatus(200, total, "CURRENT")).toBe("CURRENT");
    }
    expect(completedStatus(5, 200, "COMPLETED")).toBe("COMPLETED");
    expect(completedStatus(5, 200, "PAUSED")).toBe("PAUSED");
  });
});
