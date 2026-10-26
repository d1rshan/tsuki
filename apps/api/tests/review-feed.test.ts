import { beforeEach, describe, expect, test, vi } from "vitest";

const mocks = vi.hoisted(() => ({ query: vi.fn() }));
vi.mock("../../../packages/db/src/db", async () => {
  const { drizzle } = await import("drizzle-orm/pg-proxy");
  return { db: drizzle(mocks.query) };
});

import { MEDIA_COMPACT_COLUMNS } from "../../../packages/db/src/dal/media";
import { getRecentReviews } from "../../../packages/db/src/dal/reviews";
import { encodeReviewCursor, parseReviewCursor } from "../src/modules/reviews/service";

const publishedAt = new Date("2026-10-26T10:00:00.123Z");

beforeEach(() => {
  vi.resetAllMocks();
  mocks.query.mockResolvedValue({ rows: [] });
});

function reviewRow(id: string) {
  return [
    id,
    42,
    "ANIME",
    JSON.stringify({ version: 1, doc: { type: "doc", content: [] } }),
    publishedAt.toISOString().replace("T", " ").replace("Z", ""),
    publishedAt.toISOString().replace("T", " ").replace("Z", ""),
    ...Object.keys(MEDIA_COMPACT_COLUMNS).map(() => null),
    "reviewer",
    "Reviewer",
    null,
  ];
}

describe("recent review pagination", () => {
  test("continues strictly before the publication time and id, without positional offsets", async () => {
    await getRecentReviews({ limit: 5, cursor: { createdAt: publishedAt, id: "review-b" } });
    const [query, params] = mocks.query.mock.calls[0]!;
    expect(query).toMatch(/"reviews"\."created_at" < \$\d+/);
    expect(query).toMatch(/"reviews"\."created_at" = \$\d+ and "reviews"\."id" < \$\d+/);
    expect(query).toContain('order by "reviews"."created_at" desc, "reviews"."id" desc');
    expect(query).not.toContain("offset");
    expect(params).toContain("review-b");
    expect(params.at(-1)).toBe(6);
  });

  test("uses the last visible review as the cursor, including equal publication times", async () => {
    mocks.query.mockResolvedValue({
      rows: [reviewRow("review-c"), reviewRow("review-b"), reviewRow("review-a")],
    });
    const page = await getRecentReviews({ limit: 2 });
    expect(page.reviews.map((review) => review.id)).toEqual(["review-c", "review-b"]);
    expect(page.nextCursor).toEqual({ createdAt: publishedAt, id: "review-b" });
  });

  test("does not offer another page when there is no extra review", async () => {
    mocks.query.mockResolvedValue({ rows: [reviewRow("review-a")] });
    expect((await getRecentReviews({ limit: 2 })).nextCursor).toBeNull();
  });

  test("reads compact media fields and preserves the requested audience", async () => {
    await getRecentReviews({ limit: 5 });
    const [publicQuery, publicParams] = mocks.query.mock.calls[0]!;
    expect(publicQuery).toContain('"user"."is_private" =');
    expect(publicParams).toContain(false);
    expect(publicQuery).toContain('"media"."title_romaji"');
    for (const unused of ["description", "genres", "external_links", "title_search"]) {
      expect(publicQuery).not.toContain(`"media"."${unused}"`);
    }

    await getRecentReviews({ limit: 5, viewerId: "viewer" });
    const [followingQuery, followingParams] = mocks.query.mock.calls[1]!;
    expect(followingQuery).toContain('"social"."follower_id" =');
    expect(followingQuery).toContain('"social"."following_id" = "reviews"."user_id"');
    expect(followingParams).toContain("viewer");
  });
});

describe("review cursor wire format", () => {
  test("round-trips a publication time and tie-breaking id", () => {
    const cursor = { createdAt: publishedAt, id: "review-b" };
    expect(parseReviewCursor(encodeReviewCursor(cursor))).toEqual(cursor);
    expect(encodeReviewCursor(null)).toBeNull();
  });

  test("malformed cursors restart at the first page", () => {
    for (const raw of [
      undefined,
      null,
      "",
      "invalid|id",
      "2026-10-26T10:00:00Z|",
      "missing-separator",
    ]) {
      expect(parseReviewCursor(raw)).toBeUndefined();
    }
  });
});
