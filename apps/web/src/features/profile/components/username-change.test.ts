import { describe, expect, test } from "bun:test";

import { profilePathForUsername, usernameChangeErrorMessage } from "./username-change";

describe("profilePathForUsername", () => {
  test("uses Better Auth's normalized username in the destination path", () => {
    expect(profilePathForUsername("Tsuki.User_1")).toBe("/profile/tsuki.user_1");
  });
});

describe("usernameChangeErrorMessage", () => {
  test("explains the seven-day username-change policy after rate limiting", () => {
    expect(usernameChangeErrorMessage({ status: 429 })).toBe(
      "You can change your username once every 7 days. Please try again after your cooldown ends.",
    );
  });
});
