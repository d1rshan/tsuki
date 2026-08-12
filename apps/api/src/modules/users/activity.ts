import type { MediaType } from "../media/model";

const DAYS_SHOWN = 365;
const DAY_MS = 24 * 60 * 60 * 1000;

type ActivityRow = {
  amount: number;
  date: string;
  mediaType: MediaType;
};

function dayKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function activityStartDate(today: Date) {
  const start = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
  start.setUTCDate(start.getUTCDate() - (DAYS_SHOWN - 1));
  return start;
}

export function summarizeActivity(rows: ActivityRow[], today: Date) {
  const start = activityStartDate(today);
  const byDate = new Map<string, { anime: number; manga: number }>();

  for (const row of rows) {
    const counts = byDate.get(row.date) ?? { anime: 0, manga: 0 };
    counts[row.mediaType === "ANIME" ? "anime" : "manga"] += row.amount;
    byDate.set(row.date, counts);
  }

  const days = Array.from({ length: DAYS_SHOWN }, (_, index) => {
    const date = new Date(start.getTime() + index * DAY_MS);
    return { date, ...(byDate.get(dayKey(date)) ?? { anime: 0, manga: 0 }) };
  });
  const totals = days.reduce(
    (sum, day) => ({ anime: sum.anime + day.anime, manga: sum.manga + day.manga }),
    { anime: 0, manga: 0 },
  );

  return { days, totals, currentStreak: currentActivityStreak([...byDate.keys()], today) };
}

function currentActivityStreak(dates: string[], today: Date) {
  const activeDates = new Set(dates);
  const cursor = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()),
  );
  if (!activeDates.has(dayKey(cursor))) cursor.setUTCDate(cursor.getUTCDate() - 1);

  let streak = 0;
  while (activeDates.has(dayKey(cursor))) {
    streak++;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  return streak;
}
