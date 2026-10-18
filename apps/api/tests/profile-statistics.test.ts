import { describe, expect, test } from "vitest";

import type { libraryDal } from "@tsuki/db";

import { summarizeStatistics } from "../src/modules/profiles/statistics";

type Row = libraryDal.UserStatisticsRow;
const entry = (overrides: Partial<Row> = {}): Row => ({
  mediaType: "ANIME",
  status: "CURRENT",
  progress: 3,
  score: null,
  duration: 24,
  genres: ["Drama"],
  ...overrides,
});

describe("profile statistics", () => {
  test("empty libraries have no mean, a complete score scale, and no taste data", () => {
    const result = summarizeStatistics([]);
    expect(result.ANIME).toMatchObject({
      total: 0,
      completed: 0,
      progress: 0,
      rated: 0,
      meanScore: null,
      watchMinutes: 0,
      genres: [],
      statuses: [],
    });
    expect(result.ANIME.scores).toEqual(
      Array.from({ length: 10 }, (_, index) => ({ score: index + 1, count: 0 })),
    );
    expect(result.MANGA).toEqual(result.ANIME);
  });

  test("separates types, excludes unscored entries from means, and skips unknown runtimes", () => {
    const result = summarizeStatistics([
      entry({ status: "COMPLETED", progress: 12, score: 8 }),
      entry({ progress: 2, duration: null, score: 10 }),
      entry({ progress: 1 }),
      entry({ mediaType: "MANGA", progress: 50, duration: null, score: 6 }),
    ]);
    expect(result.ANIME).toMatchObject({
      total: 3,
      completed: 1,
      progress: 15,
      rated: 2,
      meanScore: 9,
      watchMinutes: 312,
      runtimeKnownEpisodes: 13,
    });
    expect(result.ANIME.scores[7]).toEqual({ score: 8, count: 1 });
    expect(result.ANIME.scores[9]).toEqual({ score: 10, count: 1 });
    expect(result.MANGA).toMatchObject({ progress: 50, meanScore: 6, watchMinutes: 0 });
  });

  test("taste excludes untouched plans, counts each genre once, and preserves no-status titles", () => {
    const result = summarizeStatistics([
      entry({ status: "PLANNING", progress: 0, score: 10, genres: ["Action"] }),
      entry({ status: null, progress: 0, genres: ["Fantasy"] }),
      entry({ status: "COMPLETED", progress: 0, score: 6, genres: ["Drama", "Drama"] }),
      entry({ status: "PLANNING", progress: 1, score: 8, genres: ["Drama"] }),
      entry({ genres: ["Comedy"] }),
    ]).ANIME;
    expect(result.genres).toEqual([
      { genre: "Drama", count: 2, meanScore: 7 },
      { genre: "Comedy", count: 1, meanScore: null },
    ]);
    expect(result.statuses).toContainEqual({ status: "UNSET", count: 1 });
    expect(result.total).toBe(5);
  });
});
