import { describe, expect, test } from "bun:test";

import { logSnapshot } from "./snapshot";

describe("LOG Activity snapshot", () => {
  test("mirrors the viewer-facing fields of the entry", () => {
    const entry = {
      status: "COMPLETED" as const,
      score: 9,
      progress: 24,
      progressVolumes: null,
      repeat: 1,
    };

    expect(logSnapshot(entry)).toEqual({
      status: "COMPLETED",
      score: 9,
      progress: 24,
      progressVolumes: null,
      repeat: 1,
    });
  });
});
