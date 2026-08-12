export function selfFollowError(viewerId: string, profileUserId: string) {
  return viewerId === profileUserId ? "You cannot follow yourself" : null;
}
