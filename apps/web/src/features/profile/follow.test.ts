import { describe, expect, test } from "bun:test";

import { followButtonLabel } from "./follow";
import { profileKeys } from "./query-keys";

describe("follow button", () => {
  test("represents each relationship state", () => {
    expect(followButtonLabel()).toBe("Follow");
    expect(followButtonLabel({ followedBy: true, following: false })).toBe("Follow back");
    expect(followButtonLabel({ followedBy: false, following: true })).toBe("Following");
    expect(followButtonLabel({ followedBy: true, following: true })).toBe("Following");
  });

  test("keeps relationship caches separate for each viewer", () => {
    expect(profileKeys.relationship("viewer-1", "profile")).not.toEqual(
      profileKeys.relationship("viewer-2", "profile"),
    );
  });
});
