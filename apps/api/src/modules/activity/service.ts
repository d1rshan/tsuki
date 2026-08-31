import { renderRichContent } from "@tsuki/rich-content";
import { activityDal } from "@tsuki/db";

type Cursor = { occurredAt: Date; id: string };

/**
 * The wire format is `occurredAt ISO|id`. Anything unparseable — a client
 * guessing the format, an old shape — reads as "start from the top" rather
 * than erroring.
 */
export function parseActivityCursor(raw?: string | null): Cursor | undefined {
  const [occurredAt, id] = raw?.split("|") ?? [];
  if (!occurredAt || !id || Number.isNaN(Date.parse(occurredAt))) return undefined;

  return { occurredAt: new Date(occurredAt), id };
}

export function encodeActivityCursor(cursor: Cursor | null): string | null {
  return cursor ? `${cursor.occurredAt.toISOString()}|${cursor.id}` : null;
}

/**
 * Review cards ship pre-rendered HTML; the stored document never crosses
 * the wire, so clients need no renderer (or its validation) at all.
 */
function toWire(rows: Awaited<ReturnType<typeof activityDal.getPublicActivity>>["activities"]) {
  return rows.map((activity) => {
    const { content, ...snapshot } = activity.snapshot;
    return {
      ...activity,
      snapshot: content
        ? { ...snapshot, contentHtml: renderRichContent(content, "compact") }
        : snapshot,
    };
  });
}

type ActivityRows = Awaited<ReturnType<typeof activityDal.getUserActivity>>;

function toPage(rows: ActivityRows) {
  return {
    activities: toWire(rows.activities),
    nextCursor: encodeActivityCursor(rows.nextCursor),
  };
}

/** The Activity Feed: Following mode shows Followed accounts, Public shows everyone. */
export async function getActivityFeed(
  viewerId: string,
  mode: "following" | "public",
  query: { cursor?: string; limit?: number },
) {
  const feed =
    mode === "following"
      ? await activityDal.getFollowingActivity(viewerId, {
          cursor: parseActivityCursor(query.cursor),
          limit: query.limit ?? 20,
        })
      : await activityDal.getPublicActivity({
          cursor: parseActivityCursor(query.cursor),
          limit: query.limit ?? 20,
        });

  return toPage(feed);
}

/** A Profile's own Activity stream, newest-first — public to any visitor. */
export async function getUserActivity(actorId: string, query: { cursor?: string; limit?: number }) {
  return toPage(
    await activityDal.getUserActivity(actorId, {
      cursor: parseActivityCursor(query.cursor),
      limit: query.limit ?? 10,
    }),
  );
}
