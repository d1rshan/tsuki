import { describe, expect, test } from "bun:test";

describe("follow relationships", () => {
  test("derives each direction independently", async () => {
    process.env.DATABASE_URL ??= "postgresql://test:test@localhost/test";
    const { relationshipFromRows } = await import("./social");

    expect(relationshipFromRows([], "viewer", "profile")).toEqual({
      followedBy: false,
      following: false,
    });
    expect(
      relationshipFromRows([{ followerId: "profile", followingId: "viewer" }], "viewer", "profile"),
    ).toEqual({ followedBy: true, following: false });
  });

  test("derives mutual following from two directed rows", async () => {
    process.env.DATABASE_URL ??= "postgresql://test:test@localhost/test";
    const { relationshipFromRows } = await import("./social");

    expect(
      relationshipFromRows(
        [
          { followerId: "viewer", followingId: "profile" },
          { followerId: "profile", followingId: "viewer" },
        ],
        "viewer",
        "profile",
      ),
    ).toEqual({ followedBy: true, following: true });
  });
});
