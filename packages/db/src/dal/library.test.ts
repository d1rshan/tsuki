import { describe, expect, test } from "bun:test";

describe("library progress activity", () => {
  test("records only progress that was added", async () => {
    process.env.DATABASE_URL ??= "postgresql://test:test@localhost/test";
    const { progressAdded } = await import("./library");

    expect(progressAdded(0, 3)).toBe(3);
    expect(progressAdded(7, 9)).toBe(2);
    expect(progressAdded(7, 7)).toBe(0);
    expect(progressAdded(7, 4)).toBe(0);
    expect(progressAdded(7, undefined)).toBe(0);
  });
});
