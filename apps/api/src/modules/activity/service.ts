import { activityDal } from "@tsuki/db";

type Cursor = { occurredAt: Date; id: string };

/**
 * The wire format is `occurredAt ISO|id`. Anything unparseable — a client
 * guessing the format, an old shape — reads as "start from the top" rather
 * than erroring.
 */
function parseFeedCursor(raw?: string | null): Cursor | undefined {
  const [occurredAt, id] = raw?.split("|") ?? [];
  if (!occurredAt || !id || Number.isNaN(Date.parse(occurredAt))) return undefined;

  return { occurredAt: new Date(occurredAt), id };
}

function encodeFeedCursor(cursor: Cursor | null): string | null {
  return cursor ? `${cursor.occurredAt.toISOString()}|${cursor.id}` : null;
}

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
