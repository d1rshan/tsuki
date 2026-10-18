import type { libraryDal } from "@tsuki/db";

import type { ProfileStatistics } from "./model";

type UserStatisticsRow = libraryDal.UserStatisticsRow;

/** Library totals include planned titles; taste reflects titles actually started. */
export function summarizeStatistics(rows: UserStatisticsRow[]): ProfileStatistics {
  const summarize = (mediaType: UserStatisticsRow["mediaType"]) => {
    const entries = rows.filter((row) => row.mediaType === mediaType);
    const scores = Array.from({ length: 10 }, (_, index) => ({ score: index + 1, count: 0 }));
    const statuses = new Map<string, number>();
    const genres = new Map<string, { count: number; rated: number; scoreSum: number }>();
    let completed = 0;
    let progress = 0;
    let rated = 0;
    let scoreSum = 0;
    let watchMinutes = 0;
    let runtimeKnownEpisodes = 0;

    for (const entry of entries) {
      const amount = Math.max(0, entry.progress);
      progress += amount;
      if (entry.status === "COMPLETED") completed++;
      const status = entry.status ?? "UNSET";
      statuses.set(status, (statuses.get(status) ?? 0) + 1);
      if (entry.score !== null) {
        rated++;
        scoreSum += entry.score;
        scores[entry.score - 1]!.count++;
      }
      if (mediaType === "ANIME" && entry.duration !== null && entry.duration > 0) {
        watchMinutes += amount * entry.duration;
        runtimeKnownEpisodes += amount;
      }
      const started = amount > 0 || (entry.status !== null && entry.status !== "PLANNING");
      if (!started) continue;
      for (const genre of new Set(entry.genres ?? [])) {
        const group = genres.get(genre) ?? { count: 0, rated: 0, scoreSum: 0 };
        group.count++;
        if (entry.score !== null) {
          group.rated++;
          group.scoreSum += entry.score;
        }
        genres.set(genre, group);
      }
    }

    return {
      total: entries.length,
      completed,
      progress,
      rated,
      meanScore: rated ? scoreSum / rated : null,
      watchMinutes,
      runtimeKnownEpisodes,
      scores,
      statuses: Array.from(statuses, ([status, count]) => ({ status, count })),
      genres: Array.from(genres, ([genre, group]) => ({
        genre,
        count: group.count,
        meanScore: group.rated ? group.scoreSum / group.rated : null,
      }))
        .sort((a, b) => b.count - a.count || a.genre.localeCompare(b.genre))
        .slice(0, 8),
    };
  };
  return { ANIME: summarize("ANIME"), MANGA: summarize("MANGA") };
}
