import { describe, expect, test } from "vitest";

import { logPhrase } from "@/features/media/labels";

describe("logPhrase", () => {
  test("CURRENT reads as watched/read, with the count inline", () => {
    expect(logPhrase("ANIME", "CURRENT", 12)).toEqual({
      lead: "watched 12 episodes of",
      progressInLead: true,
    });
    expect(logPhrase("MANGA", "CURRENT", 34)).toEqual({
      lead: "read 34 chapters of",
      progressInLead: true,
    });
    expect(logPhrase("ANIME", "CURRENT")).toEqual({ lead: "watched", progressInLead: false });
    expect(logPhrase("MANGA", "CURRENT", 0)).toEqual({ lead: "read", progressInLead: false });
  });

  test("PLANNING reads as adding to a list", () => {
    expect(logPhrase("ANIME", "PLANNING")).toEqual({
      lead: "added",
      tail: "to their watch list",
      progressInLead: false,
    });
    expect(logPhrase("MANGA", "PLANNING")).toEqual({
      lead: "added",
      tail: "to their read list",
      progressInLead: false,
    });
  });

  test("other statuses use their plain verb", () => {
    expect(logPhrase("ANIME", "COMPLETED")).toEqual({ lead: "completed", progressInLead: false });
    expect(logPhrase("MANGA", "COMPLETED")).toEqual({ lead: "completed", progressInLead: false });
    expect(logPhrase("ANIME", "DROPPED")).toEqual({ lead: "dropped", progressInLead: false });
    expect(logPhrase("MANGA", "PAUSED")).toEqual({ lead: "paused", progressInLead: false });
    expect(logPhrase("ANIME", "REPEATING")).toEqual({ lead: "rewatched", progressInLead: false });
    expect(logPhrase("MANGA", "REPEATING", 5)).toEqual({
      lead: "reread 5 chapters of",
      progressInLead: true,
    });
  });

  test("a missing status falls back to a neutral verb", () => {
    expect(logPhrase("ANIME", null)).toEqual({ lead: "updated", progressInLead: false });
  });
});
