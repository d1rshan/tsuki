import { activityDal } from "@tsuki/db";

import { encodeFeedCursor, parseFeedCursor } from "./cursor";

/** The Activity Feed: Following mode shows Followed accounts, Public shows everyone. */
export async function getActivityFeed(
  viewerId: string,
  mode: "following" | "public",
  query: { cursor?: string; limit?: number },
) {
  const feed =
    mode === "following"
      ? await activityDal.getFollowingFeed(viewerId, {
          cursor: parseFeedCursor(query.cursor),
          limit: query.limit ?? 20,
        })
      : await activityDal.getPublicFeed({
          cursor: parseFeedCursor(query.cursor),
          limit: query.limit ?? 20,
        });

  return { ...feed, nextCursor: encodeFeedCursor(feed.nextCursor) };
}
