import { eq } from "drizzle-orm";

import { db } from "../db";
import { profile } from "../schema";

export const updateUserProfile = async (
  userId: string,
  data: Partial<
    Pick<
      typeof profile.$inferInsert,
      "bio" | "bannerImage" | "socialLinks" | "avatarFileId" | "bannerFileId"
    >
  >,
) => {
  // Callers clear with null; the column defaults to `{}`. Keep one representation of "none".
  const values = data.socialLinks === null ? { ...data, socialLinks: {} } : data;

  return db
    .insert(profile)
    .values({
      userId,
      ...values,
    })
    .onConflictDoUpdate({
      target: profile.userId,
      set: { ...values, updatedAt: new Date() },
    })
    .returning();
};

export const getProfileByUserId = async (userId: string) => {
  return db.query.profile.findFirst({
    where: eq(profile.userId, userId),
  });
};
