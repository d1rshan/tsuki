import { describe, expect, test } from "bun:test";

import { selfFollowError } from "./social";

describe("follow API rules", () => {
  test("rejects self-follows before a mutation", () => {
    expect(selfFollowError("user-1", "user-1")).toBe("You cannot follow yourself");
    expect(selfFollowError("user-1", "user-2")).toBeNull();
  });
});
