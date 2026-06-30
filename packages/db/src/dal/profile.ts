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
    isPrivate?: boolean;
  },
) => {
  return db
    .insert(userProfile)
    .values({
      userId,
      ...data,
    })
    .onConflictDoUpdate({
      target: userProfile.userId,
      set: data,
    })
    .returning();
};

export const getProfileByUserId = async (userId: string) => {
  return db.query.userProfile.findFirst({
    where: eq(userProfile.userId, userId),
  });
};
