import { describe, expect, test } from "vitest";

import { adminRolesObj, ac } from "../src/permissions";

describe("role permission boundaries", () => {
  test("only owner can grant roles", () => {
    expect(adminRolesObj.owner.authorize({ user: ["set-role"] }).success).toBe(true);
    expect(adminRolesObj.admin.authorize({ user: ["set-role"] }).success).toBe(false);
  });

  test("admin retains ban and impersonation but not role management", () => {
    expect(adminRolesObj.admin.authorize({ user: ["ban", "impersonate"] }).success).toBe(true);
    expect(adminRolesObj.admin.authorize({ user: ["ban", "set-role"] }).success).toBe(false);
  });

  test("the base user role authorizes nothing", () => {
    const everyStatement = { user: ac.statements.user, session: ac.statements.session };

    expect(adminRolesObj.user.authorize(everyStatement).success).toBe(false);
  });
});
