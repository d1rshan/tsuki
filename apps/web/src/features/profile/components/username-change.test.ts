import { describe, expect, test } from "bun:test";

import { profilePathForUsername } from "./username-change";

describe("profilePathForUsername", () => {
  test("uses Better Auth's normalized username in the destination path", () => {
    expect(profilePathForUsername("Tsuki.User_1")).toBe("/profile/tsuki.user_1");
  });
});
