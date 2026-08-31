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
  test("log snapshot copies the entry's viewer-facing state", () => {
    const entry = {
      status: "CURRENT" as const,
      score: 8,
      progress: 12,
      progressVolumes: null,
      repeat: 0,
    };
    expect(logSnapshot(entry)).toEqual({
      status: "CURRENT",
      score: 8,
      progress: 12,
      progressVolumes: null,
      repeat: 0,
    });
  });

  test("review snapshot carries the full content document", () => {
    const content = { type: "doc", content: [] } as never;
    expect(reviewSnapshot({ content })).toEqual({ content });
  });
});
