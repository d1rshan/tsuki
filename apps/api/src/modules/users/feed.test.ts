import { describe, expect, test } from "bun:test";

import { encodeFeedCursor, parseFeedCursor } from "./feed";

describe("Activity Feed cursor", () => {
  test("round-trips through the wire format", () => {
    const cursor = { occurredAt: new Date("2026-08-12T10:30:00.000Z"), id: "feed-42" };

    expect(parseFeedCursor(encodeFeedCursor(cursor))).toEqual(cursor);
  });

  test("reads a missing or unparseable cursor as start from the top", () => {
    expect(parseFeedCursor(undefined)).toBeUndefined();
    expect(parseFeedCursor("")).toBeUndefined();
    expect(parseFeedCursor("not-a-date|abc")).toBeUndefined();
    expect(parseFeedCursor("2026-08-12T10:30:00.000Z")).toBeUndefined();
  });
});
