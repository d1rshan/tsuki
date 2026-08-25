import type { UserOverview } from "@tsuki/api/types";

export type ProfileActivityDay = UserOverview["activity"]["days"][number];

export function parseConnectionPage(value?: string) {
  const page = Number(value);
  return Number.isSafeInteger(page) && page > 0 ? page : 1;
}

export function activityDateKey(day: ProfileActivityDay) {
  return day.date.toISOString().slice(0, 10);
}

export function activityLevel(count: number) {
  if (count === 0) return 0;
  if (count === 1) return 1;
  if (count <= 3) return 2;
  if (count <= 6) return 3;
  return 4;
}

export function activityTooltip(day: ProfileActivityDay) {
  const date = day.date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
  const episodes = `${day.anime} ${day.anime === 1 ? "episode" : "episodes"}`;
  const chapters = `${day.manga} ${day.manga === 1 ? "chapter" : "chapters"}`;

  return `${date}: ${episodes}, ${chapters}`;
}
