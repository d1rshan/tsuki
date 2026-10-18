import type { FollowRelationship } from "@tsuki/api/types";

export function followButtonLabel(relationship?: FollowRelationship | null, isPrivate = false) {
  if (relationship?.following) return "Following";
  if (relationship?.requested) return "Requested";
  if (isPrivate) return "Request to follow";
  if (relationship?.followedBy) return "Follow back";
  return "Follow";
}
