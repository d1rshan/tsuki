import { profileDal, userDal } from "@tsuki/db";

import type { ApiMediaType } from "../media/model";
import * as libraryService from "../library/service";
import type { LibraryEntry } from "../library/model";
import * as reviewsService from "../reviews/service";
import type { Profile, UserOverview } from "./model";

const FAVORITES_LIMIT = 10;
const RECENT_LOGS_LIMIT = 10;
const RECENT_REVIEWS_LIMIT = 5;

type UserRow = NonNullable<Awaited<ReturnType<typeof userDal.getUserByUsername>>>;
type ProfileRow = NonNullable<Awaited<ReturnType<typeof profileDal.getProfileByUserId>>>;

export const toProfile = (row: ProfileRow): Profile => ({
  bio: row.bio,
  bannerImage: row.bannerImage,
  accentColor: row.accentColor,
  socialLinks: row.socialLinks,
});

function statsFor(entries: LibraryEntry[], type: ApiMediaType) {
  const forType = entries.filter((entry) => entry.mediaType === type);
  const scored = forType.filter((entry) => entry.score != null);

  return {
    total: forType.length,
    progress: forType.reduce((sum, entry) => sum + entry.progress, 0),
    meanScore: scored.length
      ? scored.reduce((sum, entry) => sum + entry.score!, 0) / scored.length
      : 0,
  };
}

export async function buildOverview(user: UserRow): Promise<UserOverview> {
  // The whole library is needed for accurate totals; the lists are slices of it.
  const [entries, recentReviews, profile] = await Promise.all([
    libraryService.getUserLibrary(user.id, {}),
    reviewsService.getUserReviews(user.id, { limit: RECENT_REVIEWS_LIMIT }),
    profileDal.getProfileByUserId(user.id),
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
    profile: profile ? toProfile(profile) : null,
    stats: {
      anime: statsFor(entries, "anime"),
      manga: statsFor(entries, "manga"),
    },
    favorites: entries.filter((entry) => entry.isFavorite).slice(0, FAVORITES_LIMIT),
    recentLogs: entries.slice(0, RECENT_LOGS_LIMIT),
    recentReviews,
  };
}
