import { t } from "elysia";

import { URL_PATTERN } from "../../patterns";
import { LibraryEntryModel } from "../library/model";
import { ReviewModel } from "../reviews/model";

export const ProfileModel = t.Object({
  bio: t.Nullable(t.String({ maxLength: 500 })),
  bannerImage: t.Nullable(t.String({ pattern: URL_PATTERN })),
  socialLinks: t.Nullable(t.Record(t.String(), t.String({ pattern: URL_PATTERN }))),
});

export const UpdateProfileModel = t.Partial(ProfileModel);

/** Public fields only — the user row also carries email, role and ban state. */
export const UserSummaryModel = t.Object({
  id: t.String(),
  name: t.String(),
  username: t.String(),
  displayUsername: t.String(),
  image: t.Nullable(t.String()),
  createdAt: t.Date(),
});

const MediaStatsModel = t.Object({
  total: t.Number(),
  /** Episodes watched or chapters read. */
  progress: t.Number(),
  meanScore: t.Number(),
});

const ActivityDayModel = t.Object({
  date: t.Date(),
  anime: t.Number(),
  manga: t.Number(),
});

const ProfileActivityModel = t.Object({
  days: t.Array(ActivityDayModel),
  totals: t.Object({ anime: t.Number(), manga: t.Number() }),
  currentStreak: t.Number(),
});

export const UserOverviewModel = t.Object({
  user: UserSummaryModel,
  profile: t.Nullable(ProfileModel),
  stats: t.Object({
    ANIME: MediaStatsModel,
    MANGA: MediaStatsModel,
  }),
  favorites: t.Array(LibraryEntryModel),
  recentLogs: t.Array(LibraryEntryModel),
  recentReviews: t.Array(ReviewModel),
  activity: ProfileActivityModel,
});

export type Profile = typeof ProfileModel.static;
export type UserOverview = typeof UserOverviewModel.static;
