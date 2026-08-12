import { describe, expect, test } from "bun:test";

import type { LibraryEntry, MediaType } from "@tsuki/api/types";

import { createContinueLogInput, getContinueEntries } from "./continue-media";

function entry({
  mediaType = "ANIME",
  progress = 3,
  status = "CURRENT",
  total = 12,
}: {
  mediaType?: MediaType;
  progress?: number;
  status?: LibraryEntry["status"];
  total?: number | null;
} = {}): LibraryEntry {
  return {
    mediaId: progress + 1,
    mediaType,
    media: {
      id: progress + 1,
      type: mediaType,
      titleRomaji: "Test title",
      titleEnglish: null,
      titleNative: null,
      coverImageExtraLarge: null,
      coverImageLarge: null,
      coverImageColor: null,
      bannerImage: null,
      format: null,
      episodes: mediaType === "ANIME" ? total : null,
      chapters: mediaType === "MANGA" ? total : null,
      seasonYear: null,
      averageScore: null,
    },
    status,
    score: null,
    progress,
    progressVolumes: null,
    repeat: 0,
    isFavorite: false,
    notes: null,
    startedAt: null,
    completedAt: null,
    createdAt: new Date(0),
    updatedAt: new Date(0),
  };
}

describe("getContinueEntries", () => {
  test("keeps active entries in activity order and handles unknown totals", () => {
    const current = entry({ progress: 4 });
    const unknownTotal = entry({ mediaType: "MANGA", progress: 20, total: null });

    expect(
      getContinueEntries(
        [
          current,
          entry({ progress: 12 }),
          entry({ progress: 2, status: "PAUSED" }),
          { ...entry(), media: null },
          unknownTotal,
        ],
        "ANIME",
        4,
      ),
    ).toEqual([current]);

    expect(getContinueEntries([current, unknownTotal], "MANGA", 4)).toEqual([unknownTotal]);
  });

  test("limits the result without changing its order", () => {
    const entries = [entry({ progress: 1 }), entry({ progress: 2 }), entry({ progress: 3 })];

    expect(getContinueEntries(entries, "ANIME", 2)).toEqual(entries.slice(0, 2));
  });

  test("completes a title when its known final unit is logged", () => {
    expect(createContinueLogInput(11, 12)).toEqual({ progress: 12, status: "COMPLETED" });
    expect(createContinueLogInput(11, null)).toEqual({ progress: 12, status: undefined });
  });
});
