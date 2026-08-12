import { describe, expect, test } from "bun:test";

import { activityDateKey, activityLevel, activityTooltip } from "./activity";

describe("profile activity heatmap", () => {
  test("maps progress totals to increasing intensity", () => {
    expect([0, 1, 2, 4, 7].map(activityLevel)).toEqual([0, 1, 2, 3, 4]);
  });

  test("describes anime and manga progress separately", () => {
    const day = { date: new Date("2026-08-12T00:00:00.000Z"), anime: 1, manga: 3 };

    expect(activityDateKey(day)).toBe("2026-08-12");
    expect(activityTooltip(day)).toBe("August 12, 2026: 1 episode, 3 chapters");
  });
});
