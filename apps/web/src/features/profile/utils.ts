import type { UserOverview } from "@tsuki/api/types";

export type ProfileActivityDay = UserOverview["activity"]["days"][number];

export type ProfileSearchParams = Record<string, string | string[] | undefined>;

/** Collapses a repeated search param to its first value. */
export function searchParam(params: ProfileSearchParams, key: string): string | undefined {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
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
