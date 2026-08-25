import { t } from "elysia";

import { URL_PATTERN } from "../../patterns";
import { FollowRelationshipModel, UserSummaryModel } from "../social/model";
import { LibraryEntryModel } from "../library/model";
import { ReviewModel } from "../reviews/model";

export const ProfileModel = t.Object({
  bio: t.Nullable(t.String({ maxLength: 500 })),
  bannerImage: t.Nullable(t.String({ pattern: URL_PATTERN })),
  socialLinks: t.Nullable(t.Record(t.String(), t.String({ pattern: URL_PATTERN }))),
});

export const UpdateProfileModel = t.Partial(ProfileModel);

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

export const ProfileSocialModel = t.Object({
  followers: t.Number(),
  following: t.Number(),
  viewer: t.Nullable(FollowRelationshipModel),
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
  social: ProfileSocialModel,
  activity: ProfileActivityModel,
});

export type Profile = typeof ProfileModel.static;
export type UserOverview = typeof UserOverviewModel.static;
