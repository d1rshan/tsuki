import { eq } from "drizzle-orm";

import { db } from "../db";
import { userProfile } from "../schema";

export const updateUserProfile = async (
  userId: string,
  data: {
    bio?: string | null;
    bannerImage?: string | null;
    accentColor?: string | null;
    socialLinks?: Record<string, string> | null;
  },
) => {
  // The column defaults to `{}`, so storing null would give "no links" two
  // representations. Callers may still send null to clear it.
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
