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

/** The default page size for Activity feeds; profile streams page smaller. */
const FEED_LIMIT = 20;
const USER_ACTIVITY_LIMIT = 10;

type FeedQuery = { cursor?: string; limit?: number };

function toDalOptions(query: FeedQuery, defaultLimit: number) {
  return { cursor: parseActivityCursor(query.cursor), limit: query.limit ?? defaultLimit };
}

/** The Following Activity Feed: accounts the viewer follows, newest-first. */
export async function getFollowingFeed(viewerId: string, query: FeedQuery) {
  return toPage(await activityDal.getFollowingActivity(viewerId, toDalOptions(query, FEED_LIMIT)));
}

/** The global public Activity stream — no viewer needed. */
export async function getPublicFeed(query: FeedQuery) {
  return toPage(await activityDal.getPublicActivity(toDalOptions(query, FEED_LIMIT)));
}

/** A Profile's own Activity stream, newest-first — public to any visitor. */
export async function getUserActivity(actorId: string, query: FeedQuery) {
  return toPage(
    await activityDal.getUserActivity(actorId, toDalOptions(query, USER_ACTIVITY_LIMIT)),
  );
}
