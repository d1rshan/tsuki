import { status } from "elysia";

import { socialDal } from "@tsuki/db";

export async function followProfile(viewerId: string, profileUserId: string) {
  if (viewerId === profileUserId) {
    return status(400, { error: "You cannot follow yourself" });
  }

  const relationship = await socialDal.getFollowRelationship(viewerId, profileUserId);
  if (relationship.following) {
    if (relationship.requested) await socialDal.cancelFollowRequest(viewerId, profileUserId);
    return socialDal.getFollowRelationship(viewerId, profileUserId);
  }

  // Privacy can change between the two guarded writes. Retry if neither won.
  for (let attempt = 0; attempt < 2; attempt++) {
    await socialDal.followUser(viewerId, profileUserId);
    if ((await socialDal.getFollowRelationship(viewerId, profileUserId)).following) {
      await socialDal.cancelFollowRequest(viewerId, profileUserId);
      return socialDal.getFollowRelationship(viewerId, profileUserId);
    }

    await socialDal.requestFollow(viewerId, profileUserId);
    const next = await socialDal.getFollowRelationship(viewerId, profileUserId);
    if (next.following) {
      if (next.requested) await socialDal.cancelFollowRequest(viewerId, profileUserId);
      return socialDal.getFollowRelationship(viewerId, profileUserId);
    }
    if (next.requested) return next;
  }

  return status(409, { error: "Profile privacy changed; please try again" });
}

export async function unfollowProfile(viewerId: string, profileUserId: string) {
  if (viewerId === profileUserId) {
    return status(400, { error: "You cannot follow yourself" });
  }

  await socialDal.unfollowUser(viewerId, profileUserId);
  await socialDal.cancelFollowRequest(viewerId, profileUserId);
  return socialDal.getFollowRelationship(viewerId, profileUserId);
}
