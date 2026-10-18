import { and, count, desc, eq, ilike, ne, or, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

import { db } from "../db";
import { followRequest, social, user } from "../schema";

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
  requested: boolean;
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

  const [request] = await db
    .select({ requesterId: followRequest.requesterId })
    .from(followRequest)
    .where(and(eq(followRequest.requesterId, viewerId), eq(followRequest.targetId, profileUserId)))
    .limit(1);

  return {
    following: rows.some((row) => row.followerId === viewerId && row.followingId === profileUserId),
    followedBy: rows.some(
      (row) => row.followerId === profileUserId && row.followingId === viewerId,
    ),
    requested: Boolean(request),
  };
};

export const canViewProfile = async (
  viewerId: string | null,
  targetId: string,
  isPrivate: boolean,
) => {
  if (!isPrivate || viewerId === targetId) return true;
  if (!viewerId) return false;
  const [row] = await db
    .select({ id: social.followerId })
    .from(social)
    .where(and(eq(social.followerId, viewerId), eq(social.followingId, targetId)))
    .limit(1);
  return Boolean(row);
};

export const requestFollow = (requesterId: string, targetId: string) =>
  db.execute(sql`
    insert into ${followRequest} (requester_id, target_id)
    select ${requesterId}, ${targetId} from ${user}
    where ${user.id} = ${targetId} and ${user.isPrivate} = true
      and not exists (
        select 1 from ${social}
        where ${social.followerId} = ${requesterId} and ${social.followingId} = ${targetId}
      )
    on conflict do nothing
  `);

export const cancelFollowRequest = (requesterId: string, targetId: string) =>
  db
    .delete(followRequest)
    .where(and(eq(followRequest.requesterId, requesterId), eq(followRequest.targetId, targetId)));

export const getFollowRequests = (targetId: string) =>
  db
    .select(PUBLIC_USER_COLUMNS)
    .from(followRequest)
    .innerJoin(user, eq(user.id, followRequest.requesterId))
    .where(eq(followRequest.targetId, targetId))
    .orderBy(desc(followRequest.createdAt));

export const acceptFollowRequest = async (requesterId: string, targetId: string) => {
  const result = await db.execute(sql`
    with accepted as (
      delete from ${followRequest}
      where ${followRequest.requesterId} = ${requesterId}
        and ${followRequest.targetId} = ${targetId}
      returning requester_id, target_id
    ), followed as (
      insert into ${social} (follower_id, following_id)
      select requester_id, target_id from accepted
      on conflict do nothing
      returning follower_id
    )
    select exists(select 1 from accepted) as accepted
  `);
  return result.rows[0]?.accepted === true;
};

export const followUser = async (followerId: string, followingId: string) => {
  return db.execute(sql`
    insert into ${social} (follower_id, following_id)
    select ${followerId}, ${followingId} from ${user}
    where ${user.id} = ${followingId} and ${user.isPrivate} = false
    on conflict do nothing
  `);
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
  conditions.push(eq(user.isPrivate, false));
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
