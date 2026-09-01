import { describe, expect, test } from "vitest";

import { logPhrase } from "@/features/media/labels";

describe("logPhrase", () => {
  test("CURRENT reads as watched/read, with the count inline", () => {
    expect(logPhrase("ANIME", { status: "CURRENT", progress: 12 })).toEqual({
      lead: "watched 12 episodes of",
      tail: undefined,
      details: "",
    });
    expect(logPhrase("MANGA", { status: "CURRENT", progress: 34 })).toEqual({
      lead: "read 34 chapters of",
      tail: undefined,
      details: "",
    });
    expect(logPhrase("ANIME", { status: "CURRENT" })).toEqual({
      lead: "watched",
      tail: undefined,
      details: "",
    });
    expect(logPhrase("MANGA", { status: "CURRENT", progress: 0 })).toEqual({
      lead: "read",
      tail: undefined,
      details: "",
    });
  });

  test("a day's range reads as the episodes watched that day", () => {
    expect(logPhrase("ANIME", { status: "CURRENT", progress: 15, progressFrom: 12 })).toEqual({
      lead: "watched episodes 13–15 of",
      tail: undefined,
      details: "",
    });
    expect(logPhrase("MANGA", { status: "CURRENT", progress: 9, progressFrom: 3 })).toEqual({
      lead: "read chapters 4–9 of",
      tail: undefined,
      details: "",
    });
  });

  test("volume progress reads as a range too, when the day moved volumes", () => {
    expect(
      logPhrase("MANGA", {
        status: "CURRENT",
        progress: 4,
        progressVolumes: 4,
        progressVolumesFrom: 2,
      }),
    ).toEqual({
      lead: "read volumes 3–4 of",
      tail: undefined,
      details: "",
    });
  });

  test("a rewatch day ranges like a first watch", () => {
    expect(logPhrase("ANIME", { status: "REPEATING", progress: 12, progressFrom: 4 })).toEqual({
      lead: "rewatched episodes 5–12 of",
      tail: undefined,
      details: "",
    });
  });

  test("a downward correction falls back to state phrasing", () => {
    expect(logPhrase("ANIME", { status: "CURRENT", progress: 10, progressFrom: 12 })).toEqual({
      lead: "watched 10 episodes of",
      tail: undefined,
      details: "",
    });
  });

  test("a score-only save reads as rated", () => {
    expect(logPhrase("ANIME", { status: "CURRENT", score: 8 })).toEqual({
      lead: "rated",
      tail: undefined,
      details: "8/10",
    });
  });

  test("PLANNING reads as adding to a list", () => {
    expect(logPhrase("ANIME", { status: "PLANNING" })).toEqual({
      lead: "added",
      tail: "to their watch list",
      details: "",
    });
    expect(logPhrase("MANGA", { status: "PLANNING" })).toEqual({
      lead: "added",
      tail: "to their read list",
      details: "",
    });
  });

  test("other statuses use their plain verb", () => {
    expect(logPhrase("ANIME", { status: "COMPLETED" })).toEqual({
      lead: "completed",
      tail: undefined,
      details: "",
    });
    expect(logPhrase("MANGA", { status: "COMPLETED" })).toEqual({
      lead: "completed",
      tail: undefined,
      details: "",
    });
    expect(logPhrase("ANIME", { status: "DROPPED" })).toEqual({
      lead: "dropped",
      tail: undefined,
      details: "",
    });
    expect(logPhrase("MANGA", { status: "PAUSED" })).toEqual({
      lead: "paused",
      tail: undefined,
      details: "",
    });
    expect(logPhrase("ANIME", { status: "REPEATING" })).toEqual({
      lead: "rewatched",
      tail: undefined,
      details: "",
    });
    expect(logPhrase("MANGA", { status: "REPEATING", progress: 5 })).toEqual({
      lead: "reread 5 chapters of",
      tail: undefined,
      details: "",
    });
  });

  test("a missing status falls back to a neutral verb", () => {
    expect(logPhrase("ANIME", { status: null })).toEqual({
      lead: "updated",
      tail: undefined,
      details: "",
    });
  });

  test("repeat counts read as 'for the Nth time', not ×N", () => {
    expect(logPhrase("ANIME", { status: "REPEATING", progress: 5, repeat: 3 })).toEqual({
      lead: "rewatched 5 episodes of",
      tail: "for the 3rd time",
      details: "",
    });
    expect(logPhrase("ANIME", { status: "COMPLETED", repeat: 21 })).toEqual({
      lead: "completed",
      tail: "for the 21st time",
      details: "",
    });
  });

  test("details carry what the lead does not", () => {
    expect(
      logPhrase("MANGA", { status: "CURRENT", progress: 9, progressVolumes: 4, score: 8 }),
    ).toEqual({
      lead: "read 9 chapters of",
      tail: undefined,
      details: "4 volumes · 8/10",
    });
    // a range lead already states the progress, so details drop it
    expect(
      logPhrase("MANGA", {
        status: "CURRENT",
        progress: 9,
        progressFrom: 3,
        progressVolumes: 4,
        score: 8,
      }).details,
    ).toBe("4 volumes · 8/10");
    // a volume-range lead states the volumes, so details drop them
    expect(
      logPhrase("MANGA", {
        status: "CURRENT",
        progressVolumes: 4,
        progressVolumesFrom: 2,
        score: 8,
      }).details,
    ).toBe("8/10");
  });

  test("verb-first mode speaks without an actor, for Profile cards", () => {
    expect(
      logPhrase("ANIME", { status: "CURRENT", progress: 15, progressFrom: 12 }, "profile"),
    ).toEqual({
      lead: "Watched episodes 13–15 of",
      tail: undefined,
      details: "",
    });
    expect(logPhrase("ANIME", { status: "CURRENT", score: 8 }, "profile")).toEqual({
      lead: "Rated",
      tail: undefined,
      details: "8/10",
    });
    expect(logPhrase("ANIME", { status: "PLANNING" }, "profile")).toEqual({
      lead: "Added",
      tail: "to the watch list",
      details: "",
    });
  });
});
