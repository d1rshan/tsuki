import { describe, expect, test } from "bun:test";

import { activityStartDate, currentActivityStreak, summarizeActivity } from "./activity";

const TODAY = new Date("2026-08-12T12:00:00.000Z");

describe("profile activity summary", () => {
  test("returns exactly the latest 365 days without fabricating activity", () => {
    const activity = summarizeActivity([], TODAY);

    expect(activity.days).toHaveLength(365);
    expect(activity.days[0]?.date.toISOString()).toBe("2025-08-13T00:00:00.000Z");
    expect(activity.days.at(-1)?.date.toISOString()).toBe("2026-08-12T00:00:00.000Z");
    expect(activity.totals).toEqual({ anime: 0, manga: 0 });
    expect(currentActivityStreak([], TODAY)).toBe(0);
    expect(activityStartDate(TODAY).toISOString()).toBe("2025-08-13T00:00:00.000Z");
  });

  test("keeps episode and chapter totals separate and combines same-day rows", () => {
    const activity = summarizeActivity(
      [
        { date: "2026-08-12", mediaType: "ANIME", amount: 2 },
        { date: "2026-08-12", mediaType: "ANIME", amount: 1 },
        { date: "2026-08-12", mediaType: "MANGA", amount: 7 },
      ],
      TODAY,
    );

    expect(activity.days.at(-1)).toEqual({
      date: new Date("2026-08-12T00:00:00.000Z"),
      anime: 3,
      manga: 7,
    });
    expect(activity.totals).toEqual({ anime: 3, manga: 7 });
  });

  test("keeps a streak current through yesterday and breaks on a missed day", () => {
    const current = currentActivityStreak(["2026-08-09", "2026-08-10", "2026-08-11"], TODAY);
    const broken = currentActivityStreak(["2026-08-10"], TODAY);

    expect(current).toBe(3);
    expect(broken).toBe(0);
  });

  test("does not cap a current streak at the heatmap range", () => {
    const dates = Array.from({ length: 400 }, (_, daysAgo) => {
      const date = new Date(TODAY);
      date.setUTCDate(date.getUTCDate() - daysAgo);
      return date.toISOString().slice(0, 10);
    });

    expect(currentActivityStreak(dates, TODAY)).toBe(400);
  });
});
