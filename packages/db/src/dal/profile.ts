import { eq } from "drizzle-orm";

import { db } from "../db";
import { userProfile } from "../schema";

export const updateUserProfile = async (
  userId: string,
  data: Partial<Pick<typeof userProfile.$inferInsert, "bio" | "bannerImage" | "socialLinks">>,
) => {
  // Callers clear with null; the column defaults to `{}`. Keep one representation of "none".
  const values = data.socialLinks === null ? { ...data, socialLinks: {} } : data;

  return db
    .insert(userProfile)
    .values({
      userId,
      ...values,
    })
    .onConflictDoUpdate({
      target: userProfile.userId,
      set: { ...values, updatedAt: new Date() },
    })
    .returning();
};

export const getProfileByUserId = async (userId: string) => {
  return db.query.userProfile.findFirst({
    where: eq(userProfile.userId, userId),
  });
};
