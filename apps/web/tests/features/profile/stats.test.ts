import { describe, expect, test } from "vitest";

import { profileActivityStatistics } from "../../../src/features/profile/stats";
import { activityTooltip } from "../../../src/features/profile/utils";

describe("profile activity statistics", () => {
  test("uses UTC months across a year boundary and keeps anime and manga separate", () => {
    const days = [
      { date: new Date("2025-12-30T00:00:00Z"), anime: 2, manga: 0 },
      { date: new Date("2025-12-31T00:00:00Z"), anime: 3, manga: 0 },
      { date: new Date("2026-01-01T00:00:00Z"), anime: 0, manga: 5 },
      { date: new Date("2026-01-02T00:00:00Z"), anime: 1, manga: 0 },
      { date: new Date("2026-01-03T00:00:00Z"), anime: 0, manga: 0 },
    ];
    expect(profileActivityStatistics(days, "ANIME")).toEqual({
      months: [
        { key: "2025-12", label: "Dec 25", amount: 5 },
        { key: "2026-01", label: "Jan 26", amount: 1 },
      ],
      activeDays: 3,
      longestStreak: 2,
      currentStreak: 1,
    });
    expect(profileActivityStatistics(days, "MANGA")).toMatchObject({
      activeDays: 1,
      longestStreak: 1,
      currentStreak: 0,
    });
  });

  test("handles no activity and includes today in an ongoing streak", () => {
    expect(profileActivityStatistics([], "ANIME")).toEqual({
      months: [],
      activeDays: 0,
      longestStreak: 0,
      currentStreak: 0,
    });
    const days = [1, 2, 3].map((day) => ({
      date: new Date(Date.UTC(2026, 0, day)),
      anime: 1,
      manga: 0,
    }));
    expect(profileActivityStatistics(days, "ANIME").currentStreak).toBe(3);
    expect(profileActivityStatistics(days, "MANGA")).toMatchObject({
      activeDays: 0,
      longestStreak: 0,
      currentStreak: 0,
    });
  });
});

test("heatmap tooltips follow the media filter while overview keeps both types", () => {
  const day = { date: new Date("2026-01-01T00:00:00Z"), anime: 2, manga: 5 };
  expect(activityTooltip(day, "ANIME")).toBe("January 1, 2026: 2 episodes");
  expect(activityTooltip(day, "MANGA")).toBe("January 1, 2026: 5 chapters");
  expect(activityTooltip(day)).toBe("January 1, 2026: 2 episodes, 5 chapters");
});
