import { describe, expect, test } from "bun:test";

import { summarizeActivity } from "./activity";

const TODAY = new Date("2026-08-12T12:00:00.000Z");

describe("profile activity summary", () => {
  test("returns exactly the latest 365 days without fabricating activity", () => {
    const activity = summarizeActivity([], TODAY);

    expect(activity.days).toHaveLength(365);
    expect(activity.days[0]?.date.toISOString()).toBe("2025-08-13T00:00:00.000Z");
    expect(activity.days.at(-1)?.date.toISOString()).toBe("2026-08-12T00:00:00.000Z");
    expect(activity.totals).toEqual({ anime: 0, manga: 0 });
    expect(activity.currentStreak).toBe(0);
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
    const current = summarizeActivity(
      ["2026-08-09", "2026-08-10", "2026-08-11"].map((date) => ({
        date,
        mediaType: "ANIME" as const,
        amount: 1,
      })),
      TODAY,
    );
    const broken = summarizeActivity(
      [{ date: "2026-08-10", mediaType: "ANIME", amount: 1 }],
      TODAY,
    );

    expect(current.currentStreak).toBe(3);
    expect(broken.currentStreak).toBe(0);
  });

  test("does not cap a current streak at the heatmap range", () => {
    const dates = Array.from({ length: 400 }, (_, daysAgo) => {
      const date = new Date(TODAY);
      date.setUTCDate(date.getUTCDate() - daysAgo);
      return date.toISOString().slice(0, 10);
    });

    const activity = summarizeActivity(
      dates.map((date) => ({ date, mediaType: "ANIME" as const, amount: 1 })),
      TODAY,
    );

    expect(activity.currentStreak).toBe(400);
  });
});
