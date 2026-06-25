import { eq, desc } from "drizzle-orm";

import { db } from "../db";
import { user } from "../schema";

export const getUserByUsername = async (username: string) => {
  return db.query.user.findFirst({
    where: eq(user.username, username),
  });
};

export const getUserById = async (id: string) => {
  return db.query.user.findFirst({
    where: eq(user.id, id),
  });
};

export const getAllUsers = async () => {
  return db.query.user.findMany({
    orderBy: [desc(user.createdAt)],
  });
};
