import { status } from "elysia";

import { activityDal, libraryDal, profileDal, reviewsDal, socialDal, userDal } from "@tsuki/db";

import type { MediaType } from "../media/model";

/**
 * Resolve a Username to the owner of that Profile, or short-circuit with 404.
 * Every route addressed by `:username` goes through here.
 */
export async function requireUser(username: string) {
  const user = await userDal.getUserByUsername(username);
  if (!user) throw status(404, { error: "User not found" });

  return user;
}

const FAVORITES_LIMIT = 10;
const RECENT_LOGS_LIMIT = 10;
const RECENT_REVIEWS_LIMIT = 5;

type ProfileUser = {
  id: string;
  name: string;
  username: string;
  displayUsername: string;
  image: string | null;
  createdAt: Date;
};

/**
 * The database counts; the two judgement calls live here. Unscored entries sit
 * out of the mean rather than counting as zero, and a user with nothing scored
 * reads as 0 rather than null. A type with no entries has no row at all.
 */
function statsFor(rows: libraryDal.LibraryStatsRow[], type: MediaType) {
  const row = rows.find((entry) => entry.mediaType === type);
  if (!row) return { total: 0, progress: 0, meanScore: 0 };

  return {
    total: row.total,
    progress: row.progress,
    meanScore: row.scoredCount ? row.scoreSum / row.scoredCount : 0,
  };
}

// ── Activity heatmap ────────────────────────────────────────────────────────

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

function summarizeActivity(rows: ActivityRow[], today: Date) {
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

/** Everything a Profile page renders in one payload. */
export async function buildUserOverview(user: ProfileUser, viewer: { id: string } | null) {
  const today = new Date();
  const [stats, favorites, recentLogs, recentReviews, profile, counts, relationship, activityRows] =
    await Promise.all([
      libraryDal.getLibraryStats(user.id),
      libraryDal.getUserLibrary(user.id, { isFavorite: true, limit: FAVORITES_LIMIT }),
      libraryDal.getUserLibrary(user.id, { limit: RECENT_LOGS_LIMIT }),
      reviewsDal.getUserReviews(user.id, { limit: RECENT_REVIEWS_LIMIT }),
      profileDal.getProfileByUserId(user.id),
      socialDal.getFollowCounts(user.id),
      viewer && viewer.id !== user.id ? socialDal.getFollowRelationship(viewer.id, user.id) : null,
      activityDal.getProgressActivity(user.id),
    ]);

  return {
    user: {
      id: user.id,
      name: user.name,
      username: user.username,
      displayUsername: user.displayUsername,
      image: user.image,
      createdAt: user.createdAt,
    },
    profile: profile ?? null,
    stats: {
      ANIME: statsFor(stats, "ANIME"),
      MANGA: statsFor(stats, "MANGA"),
    },
    favorites,
    recentLogs,
    recentReviews,
    social: { ...counts, viewer: relationship },
    activity: summarizeActivity(activityRows, today),
  };
}
