import { describe, expect, test } from "bun:test";

import { isAdminRole } from "./permissions";

describe("isAdminRole", () => {
  test("allows only admin roles", () => {
    expect(isAdminRole("owner")).toBeTrue();
    expect(isAdminRole("admin")).toBeTrue();
    expect(isAdminRole("user")).toBeFalse();
    expect(isAdminRole(null)).toBeFalse();
  });
});
