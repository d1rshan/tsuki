import { describe, expect, test } from "vitest";

import { parseUsername, usernameSchema } from "@/shared/lib/username";

describe("username validation", () => {
  test("rejects root application routes", () => {
    expect(usernameSchema.safeParse("social").success).toBe(false);
    expect(usernameSchema.safeParse("ADMIN").success).toBe(false);
  });

  test("accepts an available username", () => {
    expect(usernameSchema.safeParse("mugi_tea").success).toBe(true);
  });

  test("normalizes a valid profile lookup to its canonical Username", () => {
    expect(parseUsername("Mugi_Tea")).toBe("mugi_tea");
  });
});
