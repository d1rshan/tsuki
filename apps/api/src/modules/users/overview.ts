import { activityDal, libraryDal, profileDal, reviewsDal, socialDal } from "@tsuki/db";

import type { MediaType } from "../media/model";
import { summarizeActivity } from "./activity";

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
export function statsFor(rows: libraryDal.LibraryStatsRow[], type: MediaType) {
  const row = rows.find((entry) => entry.mediaType === type);
  if (!row) return { total: 0, progress: 0, meanScore: 0 };

  return {
    total: row.total,
    progress: row.progress,
    meanScore: row.scoredCount ? row.scoreSum / row.scoredCount : 0,
  };
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
