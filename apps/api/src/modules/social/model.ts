import { t } from "elysia";

/**
 * Public user fields only — the user row also carries email, role and ban
 * state. Mirrors PUBLIC_USER_COLUMNS in packages/db.
 */
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
  followersCount: t.Number(),
});

export const UserDiscoveryQueryModel = t.Object({
  username: t.Optional(t.String({ minLength: 1, maxLength: 30, pattern: "^[a-zA-Z0-9_.]+$" })),
});

export const UserDiscoveryModel = t.Object({
  users: t.Array(DiscoveryUserSummaryModel),
});

export const FollowListQueryModel = t.Object({
  limit: t.Optional(t.Numeric({ minimum: 1, maximum: 100, multipleOf: 1 })),
  offset: t.Optional(t.Numeric({ minimum: 0, maximum: Number.MAX_SAFE_INTEGER, multipleOf: 1 })),
});

export const FollowListModel = t.Object({
  users: t.Array(UserSummaryModel),
  total: t.Number(),
});

export type FollowRelationship = typeof FollowRelationshipModel.static;
export type DiscoveryUserSummary = typeof DiscoveryUserSummaryModel.static;
export type UserSummary = typeof UserSummaryModel.static;
