import { status } from "elysia";

import { socialDal } from "@tsuki/db";

export async function followProfile(viewerId: string, profileUserId: string) {
  if (viewerId === profileUserId) {
    return status(400, { error: "You cannot follow yourself" });
  }

  const relationship = await socialDal.getFollowRelationship(viewerId, profileUserId);
  if (relationship.following) {
    if (relationship.requested) await socialDal.cancelFollowRequest(viewerId, profileUserId);
  } else {
    await socialDal.followUser(viewerId, profileUserId);
    if ((await socialDal.getFollowRelationship(viewerId, profileUserId)).following)
      await socialDal.cancelFollowRequest(viewerId, profileUserId);
    else await socialDal.requestFollow(viewerId, profileUserId);
  }
  return socialDal.getFollowRelationship(viewerId, profileUserId);
}

export async function unfollowProfile(viewerId: string, profileUserId: string) {
  if (viewerId === profileUserId) {
    return status(400, { error: "You cannot follow yourself" });
  }

  await socialDal.unfollowUser(viewerId, profileUserId);
  await socialDal.cancelFollowRequest(viewerId, profileUserId);
  return socialDal.getFollowRelationship(viewerId, profileUserId);
}
