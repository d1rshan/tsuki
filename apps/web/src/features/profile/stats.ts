import type { MediaType, UserOverview } from "@tsuki/api/types";

/** The overview supplies a continuous, UTC-aligned window of the last 365 days. */
export function profileActivityStatistics(
  days: UserOverview["activity"]["days"],
  mediaType: MediaType,
) {
  const months = new Map<string, { key: string; label: string; amount: number }>();
  let activeDays = 0;
  let longestStreak = 0;
  let streak = 0;
  let currentStreak = 0;
  const amounts = days.map((day) => (mediaType === "ANIME" ? day.anime : day.manga));

  for (const [index, day] of days.entries()) {
    const date = new Date(day.date);
    const key = date.toISOString().slice(0, 7);
    const month = months.get(key) ?? {
      key,
      label: date.toLocaleDateString("en-US", { month: "short", year: "2-digit", timeZone: "UTC" }),
      amount: 0,
    };
    const amount = amounts[index]!;
    month.amount += amount;
    months.set(key, month);
    if (amount > 0) {
      activeDays++;
      streak++;
      longestStreak = Math.max(longestStreak, streak);
    } else streak = 0;
  }

  // A streak stays current until the end of today, even if nothing was logged yet.
  let index = amounts.length - 1;
  if (amounts[index] === 0) index--;
  for (; index >= 0 && amounts[index]! > 0; index--) currentStreak++;

  return { months: [...months.values()], activeDays, longestStreak, currentStreak };
}
