import { t } from "elysia";

import { HEX_COLOR_PATTERN, URL_PATTERN } from "../../patterns";
import { LibraryEntryModel } from "../library/model";
import { ReviewModel } from "../reviews/model";

export const ProfileModel = t.Object({
  bio: t.Nullable(t.String({ maxLength: 500 })),
  bannerImage: t.Nullable(t.String({ pattern: URL_PATTERN })),
  accentColor: t.Nullable(t.String({ pattern: HEX_COLOR_PATTERN })),
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

export const FollowRelationshipModel = t.Object({
  following: t.Boolean(),
  followedBy: t.Boolean(),
});

export const ProfileSocialModel = t.Object({
  followers: t.Number(),
  following: t.Number(),
  viewer: t.Nullable(FollowRelationshipModel),
});

export const FollowListQueryModel = t.Object({
  limit: t.Optional(t.Numeric({ minimum: 1, maximum: 100 })),
  offset: t.Optional(t.Numeric({ minimum: 0 })),
});

export const FollowListModel = t.Object({
  users: t.Array(UserSummaryModel),
  total: t.Number(),
});

const MediaStatsModel = t.Object({
  total: t.Number(),
  /** Episodes watched or chapters read. */
  progress: t.Number(),
  meanScore: t.Number(),
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
});

export type Profile = typeof ProfileModel.static;
export type FollowRelationship = typeof FollowRelationshipModel.static;
export type UserSummary = typeof UserSummaryModel.static;
export type UserOverview = typeof UserOverviewModel.static;
