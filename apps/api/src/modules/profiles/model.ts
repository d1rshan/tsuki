import { t } from "elysia";

import { URL_PATTERN } from "../../patterns";
import { FollowRelationshipModel, UserSummaryModel } from "../social/model";
import { LibraryEntryModel } from "../library/model";
import { RichContentModel } from "../rich-content/model";
import { ReviewModel } from "../reviews/model";

export const UploadAuthModel = t.Object({
  token: t.String(),
  expire: t.Number(),
  signature: t.String(),
  /** Server-mandated upload file name; binds the uploaded file to the caller. */
  fileName: t.String(),
  publicKey: t.String(),
  /** Server-derived destination folder, bound to the declared upload type. */
  folder: t.String(),
});

export const ProfileModel = t.Object({
  isPrivate: t.Optional(t.Boolean()),
  bio: t.Nullable(RichContentModel),
  bannerImage: t.Nullable(t.String({ pattern: URL_PATTERN })),
  socialLinks: t.Nullable(t.Record(t.String(), t.String({ pattern: URL_PATTERN }))),
  image: t.Optional(t.Nullable(t.String({ pattern: URL_PATTERN }))),
});

export const UpdateProfileModel = t.Object({
  isPrivate: t.Optional(t.Boolean()),
  bio: t.Optional(t.Nullable(RichContentModel)),
  bannerImage: t.Optional(t.Nullable(t.String({ pattern: URL_PATTERN }))),
  image: t.Optional(t.Nullable(t.String({ pattern: URL_PATTERN }))),
  socialLinks: t.Optional(t.Nullable(t.Record(t.String(), t.String({ pattern: URL_PATTERN })))),
});

export type UploadAuth = typeof UploadAuthModel.static;
export type UpdateProfile = typeof UpdateProfileModel.static;

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

/** Private banners remain access-controlled through the overview endpoint. */
export const ProfileIdentityModel = t.Object({
  user: UserSummaryModel,
  isPrivate: t.Boolean(),
  bannerImage: t.Nullable(t.String({ pattern: URL_PATTERN })),
});

export const UserOverviewModel = t.Object({
  user: UserSummaryModel,
  isPrivate: t.Boolean(),
  locked: t.Boolean(),
  profile: t.Nullable(ProfileModel),
  stats: t.Object({
    ANIME: MediaStatsModel,
    MANGA: MediaStatsModel,
  }),
  favorites: t.Array(LibraryEntryModel),
  recentReviews: t.Array(ReviewModel),
  social: ProfileSocialModel,
  activity: ProfileActivityModel,
});

export type Profile = typeof ProfileModel.static;
export type UserOverview = typeof UserOverviewModel.static;

const ProfileMediaStatisticsModel = t.Object({
  total: t.Number(),
  completed: t.Number(),
  progress: t.Number(),
  rated: t.Number(),
  meanScore: t.Nullable(t.Number()),
  watchMinutes: t.Number(),
  runtimeKnownEpisodes: t.Number(),
  scores: t.Array(t.Object({ score: t.Number(), count: t.Number() })),
  statuses: t.Array(t.Object({ status: t.String(), count: t.Number() })),
  genres: t.Array(
    t.Object({
      genre: t.String(),
      count: t.Number(),
      meanScore: t.Nullable(t.Number()),
    }),
  ),
});

export const ProfileStatisticsModel = t.Object({
  ANIME: ProfileMediaStatisticsModel,
  MANGA: ProfileMediaStatisticsModel,
});
export type ProfileStatistics = typeof ProfileStatisticsModel.static;
