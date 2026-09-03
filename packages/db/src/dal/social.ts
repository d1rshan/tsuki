import { and, count, desc, eq, ilike, ne, or } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

import { db } from "../db";
import { social, user } from "../schema";

function usernamePrefixPattern(prefix: string) {
  return `${prefix.toLowerCase().replace(/[\\%_]/g, "\\$&")}%`;
}

const PUBLIC_USER_COLUMNS = {
  id: user.id,
  name: user.name,
  username: user.username,
  displayUsername: user.displayUsername,
  image: user.image,
  createdAt: user.createdAt,
};

export type FollowRelationship = {
  following: boolean;
  followedBy: boolean;
};

type FollowListOptions = {
  limit: number;
  offset: number;
};

const followers = alias(social, "followers");

type DiscoveryOptions = {
  limit: number;
  usernamePrefix?: string;
};

export const getFollowCounts = async (userId: string) => {
  const [followers, following] = await Promise.all([
    getFollowerCount(userId),
    getFollowingCount(userId),
  ]);

  return { followers, following };
};

export const getFollowerCount = async (userId: string) => {
  const [result] = await db
    .select({ count: count() })
    .from(social)
    .where(eq(social.followingId, userId));

  return result?.count ?? 0;
};

export const getFollowingCount = async (userId: string) => {
  const [result] = await db
    .select({ count: count() })
    .from(social)
    .where(eq(social.followerId, userId));

  return result?.count ?? 0;
};

export const getFollowRelationship = async (viewerId: string, profileUserId: string) => {
  const rows = await db
    .select({ followerId: social.followerId, followingId: social.followingId })
    .from(social)
    .where(
      or(
        and(eq(social.followerId, viewerId), eq(social.followingId, profileUserId)),
        and(eq(social.followerId, profileUserId), eq(social.followingId, viewerId)),
      ),
    );

  return {
    following: rows.some((row) => row.followerId === viewerId && row.followingId === profileUserId),
    followedBy: rows.some(
      (row) => row.followerId === profileUserId && row.followingId === viewerId,
    ),
  };
};

export const followUser = async (followerId: string, followingId: string) => {
  return db
    .insert(social)
    .values({ followerId, followingId })
    .onConflictDoNothing({ target: [social.followerId, social.followingId] })
    .returning({ followingId: social.followingId });
};

export const unfollowUser = async (followerId: string, followingId: string) => {
  return db
    .delete(social)
    .where(and(eq(social.followerId, followerId), eq(social.followingId, followingId)));
};

export const getFollowers = async (userId: string, { limit, offset }: FollowListOptions) => {
  return db
    .select(PUBLIC_USER_COLUMNS)
    .from(social)
    .innerJoin(user, eq(user.id, social.followerId))
    .where(eq(social.followingId, userId))
    .orderBy(desc(social.createdAt), desc(social.followerId))
    .limit(limit)
    .offset(offset);
};

export const getFollowing = async (userId: string, { limit, offset }: FollowListOptions) => {
  return db
    .select(PUBLIC_USER_COLUMNS)
    .from(social)
    .innerJoin(user, eq(user.id, social.followingId))
    .where(eq(social.followerId, userId))
    .orderBy(desc(social.createdAt), desc(social.followingId))
    .limit(limit)
    .offset(offset);
};

/** Popular users or username-prefix matches, ordered by follower count. Public. */
export const getUserDiscovery = async (
  viewerId: string | null,
  { limit, usernamePrefix }: DiscoveryOptions,
) => {
  const conditions = [];
  if (viewerId) conditions.push(ne(user.id, viewerId));
  if (usernamePrefix) conditions.push(ilike(user.username, usernamePrefixPattern(usernamePrefix)));

  return db
    .select({
      ...PUBLIC_USER_COLUMNS,
      followersCount: count(followers.followerId),
    })
    .from(user)
    .leftJoin(followers, eq(followers.followingId, user.id))
    .where(and(...conditions))
    .groupBy(user.id, user.name, user.username, user.displayUsername, user.image, user.createdAt)
    .orderBy(desc(count(followers.followerId)), desc(user.createdAt))
    .limit(limit);
};
