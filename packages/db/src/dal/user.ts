import { eq } from "drizzle-orm";

import { db } from "../db";
import { user } from "../schema";

export const getUserByUsername = async (username: string) => {
  return db.query.user.findFirst({
    where: eq(user.username, username.toLowerCase()),
  });
};

export const setPrivacy = async (userId: string, isPrivate: boolean) =>
  db
    .update(user)
    .set({ isPrivate })
    .where(eq(user.id, userId))
    .returning({ isPrivate: user.isPrivate });
