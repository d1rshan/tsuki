import { status } from "elysia";

import { activityDal, socialDal } from "@tsuki/db";

/**
 * Follow a Profile: records Activity only when the Follow is newly created, so
 * re-following someone never duplicates their card in the feed.
 */
export async function followProfile(viewerId: string, profileUserId: string) {
  if (viewerId === profileUserId) {
    return status(400, { error: "You cannot follow yourself" });
  }

  const created = await socialDal.followUser(viewerId, profileUserId);
  if (created.length) {
    // A Follow has no media and no prior identity to key off, so its own
    // random id is the source id.
    await activityDal.upsertFeedActivity({
      actorId: viewerId,
      type: "FOLLOW",
      sourceId: crypto.randomUUID(),
      targetUserId: profileUserId,
      snapshot: {},
    });
  }

  return socialDal.getFollowRelationship(viewerId, profileUserId);
}

export async function unfollowProfile(viewerId: string, profileUserId: string) {
  if (viewerId === profileUserId) {
    return status(400, { error: "You cannot follow yourself" });
  }

  await socialDal.unfollowUser(viewerId, profileUserId);
  return socialDal.getFollowRelationship(viewerId, profileUserId);
}
