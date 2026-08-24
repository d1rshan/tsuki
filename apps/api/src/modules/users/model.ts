import { t } from "elysia";

import { URL_PATTERN } from "../../patterns";
import { LibraryEntryModel, ListStatusEnum } from "../library/model";
import { MediaCompactModel } from "../media/model";
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

export const FollowRelationshipModel = t.Object({
  following: t.Boolean(),
  followedBy: t.Boolean(),
});

export const DiscoveryUserSummaryModel = t.Object({
  id: t.String(),
  name: t.String(),
  username: t.String(),
  displayUsername: t.String(),
  image: t.Nullable(t.String()),
  createdAt: t.Date(),
  relationship: FollowRelationshipModel,
});

export const UserDiscoveryQueryModel = t.Object({
  username: t.Optional(t.String({ minLength: 1, maxLength: 30, pattern: "^[a-zA-Z0-9_.]+$" })),
});

export const UserDiscoveryModel = t.Object({
  users: t.Array(DiscoveryUserSummaryModel),
});

const FeedActorModel = t.Object({
  username: t.String(),
  displayUsername: t.String(),
  image: t.Nullable(t.String()),
});

const FeedSnapshotModel = t.Object({
  status: t.Optional(t.Nullable(ListStatusEnum)),
  score: t.Optional(t.Nullable(t.Number())),
  progress: t.Optional(t.Number()),
  progressVolumes: t.Optional(t.Nullable(t.Number())),
  repeat: t.Optional(t.Number()),
  content: t.Optional(t.String()),
  containsSpoilers: t.Optional(t.Boolean()),
});

export const FeedActivityModel = t.Object({
  id: t.String(),
  type: t.Union([t.Literal("LOG"), t.Literal("REVIEW"), t.Literal("FOLLOW")]),
  snapshot: FeedSnapshotModel,
  occurredAt: t.Date(),
  actor: FeedActorModel,
  media: t.Nullable(MediaCompactModel),
  target: t.Nullable(t.Object({ username: t.String(), displayUsername: t.String() })),
});

export const FeedQueryModel = t.Object({
  type: t.Union([t.Literal("following"), t.Literal("public")]),
  cursor: t.Optional(t.String()),
  limit: t.Optional(t.Numeric({ minimum: 1, maximum: 50, multipleOf: 1 })),
});

export const FeedModel = t.Object({
  activities: t.Array(FeedActivityModel),
  nextCursor: t.Nullable(t.String()),
});

export const ProfileSocialModel = t.Object({
  followers: t.Number(),
  following: t.Number(),
  viewer: t.Nullable(FollowRelationshipModel),
});

export const FollowListQueryModel = t.Object({
  limit: t.Optional(t.Numeric({ minimum: 1, maximum: 100, multipleOf: 1 })),
  offset: t.Optional(t.Numeric({ minimum: 0, maximum: Number.MAX_SAFE_INTEGER, multipleOf: 1 })),
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
  social: ProfileSocialModel,
  activity: ProfileActivityModel,
});

export type Profile = typeof ProfileModel.static;
export type FollowRelationship = typeof FollowRelationshipModel.static;
export type DiscoveryUserSummary = typeof DiscoveryUserSummaryModel.static;
export type FeedActivity = typeof FeedActivityModel.static;
export type UserSummary = typeof UserSummaryModel.static;
export type UserOverview = typeof UserOverviewModel.static;
