import type { FollowRelationship } from "@tsuki/api/types";

export function followButtonLabel(relationship?: FollowRelationship | null) {
  if (relationship?.following) return "Following";
  if (relationship?.followedBy) return "Follow back";
  return "Follow";
}
