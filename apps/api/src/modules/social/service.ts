import { status } from "elysia";

import { socialDal } from "@tsuki/db";

export async function followProfile(viewerId: string, profileUserId: string) {
  if (viewerId === profileUserId) {
    return status(400, { error: "You cannot follow yourself" });
  }

  await socialDal.followUser(viewerId, profileUserId);
  return socialDal.getFollowRelationship(viewerId, profileUserId);
}

export async function unfollowProfile(viewerId: string, profileUserId: string) {
  if (viewerId === profileUserId) {
    return status(400, { error: "You cannot follow yourself" });
  }

  await socialDal.unfollowUser(viewerId, profileUserId);
  return socialDal.getFollowRelationship(viewerId, profileUserId);
}
