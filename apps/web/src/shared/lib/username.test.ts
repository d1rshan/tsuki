import { describe, expect, test } from "bun:test";

import { parseUsername } from "./username";

describe("parseUsername", () => {
  test("accepts canonical usernames", () => {
    expect(parseUsername("Tsuki.user_1")).toBe("Tsuki.user_1");
  });

  test("rejects malformed and overlong route values", () => {
    expect(parseUsername("ab")).toBeNull();
    expect(parseUsername("user-name")).toBeNull();
    expect(parseUsername(`user${"x".repeat(30)}`)).toBeNull();
    expect(parseUsername(" user ")).toBeNull();
  });
});
