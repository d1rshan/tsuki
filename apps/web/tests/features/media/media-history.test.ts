import { describe, expect, test } from "vitest";

import { parseMediaHistoryEntry } from "@/features/media/media-history";

describe("parseMediaHistoryEntry", () => {
  test("restores the media identity when a previous page load's object is unavailable", () => {
    expect(parseMediaHistoryEntry({ entryId: "previous-entry", type: "MANGA", id: 26004 })).toEqual(
      {
        entryId: "previous-entry",
        type: "MANGA",
        id: 26004,
        search: "",
      },
    );
  });

  test("preserves the background discovery query for an older modal entry", () => {
    const entry = { entryId: "entry", type: "MANGA", id: 26004, search: "?type=MANGA&q=hero" };
    expect(parseMediaHistoryEntry(entry)).toEqual(entry);
  });

  test("ignores ordinary history state and invalid media identities", () => {
    for (const value of [
      null,
      "old-token",
      {},
      { entryId: "", type: "ANIME", id: 7442 },
      { entryId: "entry", type: "anime", id: 7442 },
      { entryId: "entry", type: "ANIME", id: "7442" },
      { entryId: "entry", type: "ANIME", id: 0 },
      { entryId: "entry", type: "ANIME", id: -1 },
      { entryId: "entry", type: "ANIME", id: 1.5 },
      { entryId: "entry", type: "ANIME", id: 2_147_483_648 },
      { entryId: "entry", type: "ANIME", id: 7442, search: 42 },
      { entryId: "entry", type: "ANIME", id: 7442, search: "/another-page" },
    ]) {
      expect(parseMediaHistoryEntry(value)).toBeNull();
    }
  });
});
