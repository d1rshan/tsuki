import { eq } from "drizzle-orm";

import { db } from "../db";
import { user } from "../schema";

export const getUserByUsername = async (username: string) => {
  return db.query.user.findFirst({
    where: eq(user.username, username.toLowerCase()),
  });
};

export const getUserById = async (id: string) => {
  return db.query.user.findFirst({
    where: eq(user.id, id),
  });
};

export const updateUser = async (
  userId: string,
  data: Partial<Pick<typeof user.$inferInsert, "image" | "name" | "displayUsername">>,
) => {
  return db
    .update(user)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(user.id, userId))
    .returning();
};
