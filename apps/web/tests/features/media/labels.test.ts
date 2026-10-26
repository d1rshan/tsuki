import { describe, expect, test } from "vitest";

import { logPhrase, reviewFragment, reviewHref } from "@/features/media/labels";

describe("Activity wording", () => {
  test("progress ranges and ungrounded counts describe the earned progress", () => {
    expect(logPhrase("ANIME", { progress: 15, progressFrom: 12 })).toEqual({
      lead: "Watched episodes 13–15 of",
    });
    expect(logPhrase("MANGA", { progress: 15, progressFrom: 12 })).toEqual({
      lead: "Read chapters 13–15 of",
    });
    expect(logPhrase("ANIME", { progress: 15, progressFrom: null })).toEqual({
      lead: "Watched 15 episodes of",
    });
    expect(logPhrase("MANGA", { progress: 15, progressFrom: null })).toEqual({
      lead: "Read 15 chapters of",
    });
  });

  test("status transitions use the media-specific label", () => {
    expect(logPhrase("ANIME", { status: "COMPLETED", statusFrom: "CURRENT" })).toEqual({
      lead: "Changed status to Completed for",
    });
    expect(logPhrase("MANGA", { status: "CURRENT", statusFrom: null })).toEqual({
      lead: "Changed status to Reading for",
    });
    expect(logPhrase("ANIME", { status: "REPEATING", statusFrom: "COMPLETED" })).toEqual({
      lead: "Changed status to Rewatching for",
    });
  });

  test("same-day status reversals remain visible with and without progress", () => {
    const snapshot = { status: "CURRENT", statusFrom: "CURRENT", statusChanged: true } as const;
    expect(logPhrase("ANIME", snapshot)).toEqual({ lead: "Changed status to Watching for" });
    expect(logPhrase("MANGA", snapshot)).toEqual({ lead: "Changed status to Reading for" });
    expect(logPhrase("ANIME", { ...snapshot, statusChanged: false })).toBeNull();
    expect(logPhrase("ANIME", { ...snapshot, progress: 13, progressFrom: 12 })).toEqual({
      lead: "Watched episodes 13–13 of",
      tail: "· changed status to Watching",
    });
  });

  test("completion includes both progress and status in one sentence", () => {
    expect(
      logPhrase("ANIME", {
        progress: 200,
        progressFrom: 199,
        status: "COMPLETED",
        statusFrom: "CURRENT",
      }),
    ).toEqual({
      lead: "Watched episodes 200–200 of",
      tail: "· changed status to Completed",
    });
  });

  test("unsupported snapshots and corrections have no generic fallback", () => {
    for (const snapshot of [
      {},
      { status: "CURRENT" as const },
      { progress: 10 },
      { progress: 10, progressFrom: 12 },
      { status: "CURRENT" as const, statusFrom: "CURRENT" as const },
    ]) {
      expect(logPhrase("ANIME", snapshot)).toBeNull();
    }
  });

  test("review links select the correct filter and stable fragment", () => {
    for (const type of ["ANIME", "MANGA"] as const) {
      expect(reviewFragment(type, 42)).toBe(`review-${type.toLowerCase()}-42`);
      expect(reviewHref("test-user", type, 42)).toBe(
        `/test-user/reviews?type=${type}#review-${type.toLowerCase()}-42`,
      );
    }
  });
});
