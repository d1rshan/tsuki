import { describe, expect, test } from "bun:test";

import { parseUsername, usernameSchema } from "./username";

describe("username validation", () => {
  test("rejects root application routes", () => {
    expect(usernameSchema.safeParse("social").success).toBeFalse();
    expect(usernameSchema.safeParse("ADMIN").success).toBeFalse();
  });

  test("accepts an available username", () => {
    expect(usernameSchema.safeParse("mugi_tea").success).toBeTrue();
  });

  test("normalizes a valid profile lookup to its canonical Username", () => {
    expect(parseUsername("Mugi_Tea")).toBe("mugi_tea");
  });
});
