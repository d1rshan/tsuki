import { describe, expect, test } from "bun:test";

import { isUsernameChangeOnCooldown, USERNAME_CHANGE_COOLDOWN_MS } from "./username-change";

describe("username change cooldown", () => {
  const changedAt = new Date("2026-08-01T00:00:00.000Z");

  test("ends exactly seven days after the previous change", () => {
    expect(
      isUsernameChangeOnCooldown(changedAt, changedAt.getTime() + USERNAME_CHANGE_COOLDOWN_MS - 1),
    ).toBe(true);
    expect(
      isUsernameChangeOnCooldown(changedAt, changedAt.getTime() + USERNAME_CHANGE_COOLDOWN_MS),
    ).toBe(false);
  });
});
