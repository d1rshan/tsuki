import { status } from "elysia";

import { userDal } from "@tsuki/db";

/**
 * Resolve a Username to the owner of that Profile, or short-circuit with 404.
 * Every route addressed by `:username` goes through here.
 */
export async function requireUser(username: string) {
  const user = await userDal.getUserByUsername(username);
  if (!user) throw status(404, { error: "User not found" });

  return user;
}
