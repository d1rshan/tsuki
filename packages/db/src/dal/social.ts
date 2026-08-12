import { and, count, desc, eq, or } from "drizzle-orm";

import { db } from "../db";
import { user, userFollows } from "../schema";

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

export function relationshipFromRows(
  rows: { followerId: string; followingId: string }[],
  viewerId: string,
  profileUserId: string,
): FollowRelationship {
  return {
    following: rows.some((row) => row.followerId === viewerId && row.followingId === profileUserId),
    followedBy: rows.some(
      (row) => row.followerId === profileUserId && row.followingId === viewerId,
    ),
  };
}

export const getFollowCounts = async (userId: string) => {
  const [[followers], [following]] = await Promise.all([
    db.select({ count: count() }).from(userFollows).where(eq(userFollows.followingId, userId)),
    db.select({ count: count() }).from(userFollows).where(eq(userFollows.followerId, userId)),
  ]);

  return {
    followers: followers?.count ?? 0,
    following: following?.count ?? 0,
  };
};

export const getFollowerCount = async (userId: string) => {
  const [result] = await db
    .select({ count: count() })
    .from(userFollows)
    .where(eq(userFollows.followingId, userId));

  return result?.count ?? 0;
};

export const getFollowingCount = async (userId: string) => {
  const [result] = await db
    .select({ count: count() })
    .from(userFollows)
    .where(eq(userFollows.followerId, userId));

  return result?.count ?? 0;
};

export const getFollowRelationship = async (viewerId: string, profileUserId: string) => {
  const rows = await db
    .select({ followerId: userFollows.followerId, followingId: userFollows.followingId })
    .from(userFollows)
    .where(
      or(
        and(eq(userFollows.followerId, viewerId), eq(userFollows.followingId, profileUserId)),
        and(eq(userFollows.followerId, profileUserId), eq(userFollows.followingId, viewerId)),
      ),
    );

  return relationshipFromRows(rows, viewerId, profileUserId);
};

export const followUser = async (followerId: string, followingId: string) => {
  return db
    .insert(userFollows)
    .values({ followerId, followingId })
    .onConflictDoNothing({ target: [userFollows.followerId, userFollows.followingId] });
};

export const unfollowUser = async (followerId: string, followingId: string) => {
  return db
    .delete(userFollows)
    .where(and(eq(userFollows.followerId, followerId), eq(userFollows.followingId, followingId)));
};

export const getFollowers = async (userId: string, { limit, offset }: FollowListOptions) => {
  return db
    .select(PUBLIC_USER_COLUMNS)
    .from(userFollows)
    .innerJoin(user, eq(user.id, userFollows.followerId))
    .where(eq(userFollows.followingId, userId))
    .orderBy(desc(userFollows.createdAt), desc(userFollows.followerId))
    .limit(limit)
    .offset(offset);
};

export const getFollowing = async (userId: string, { limit, offset }: FollowListOptions) => {
  return db
    .select(PUBLIC_USER_COLUMNS)
    .from(userFollows)
    .innerJoin(user, eq(user.id, userFollows.followingId))
    .where(eq(userFollows.followerId, userId))
    .orderBy(desc(userFollows.createdAt), desc(userFollows.followingId))
    .limit(limit)
    .offset(offset);
};
