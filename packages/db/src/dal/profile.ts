import { eq } from "drizzle-orm";

import { db } from "../db";
import { profile, user } from "../schema";

export const updateUserProfile = async (
  userId: string,
  data: Partial<Pick<typeof profile.$inferInsert, "bio" | "bannerImage" | "socialLinks">>,
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

/**
 * Updates the user's avatar (user row) and their profile row atomically.
 * neon-http has no interactive transactions; `db.batch` is its transactional
 * form — one HTTP round trip, rolled back entirely if any statement fails.
 */
export const updateUserAndProfile = async (
  userId: string,
  image: string | null,
  data: Partial<Pick<typeof profile.$inferInsert, "bio" | "bannerImage" | "socialLinks">>,
) => {
  // Callers clear with null; the column defaults to `{}`. Keep one representation of "none".
  const values = data.socialLinks === null ? { ...data, socialLinks: {} } : data;

  const [userRows, profileRows] = await db.batch([
    db.update(user).set({ image, updatedAt: new Date() }).where(eq(user.id, userId)).returning(),
    db
      .insert(profile)
      .values({ userId, ...values })
      .onConflictDoUpdate({ target: profile.userId, set: { ...values, updatedAt: new Date() } })
      .returning(),
  ]);
  return { image: userRows[0]?.image ?? null, profile: profileRows[0] ?? null };
};

export const getProfileByUserId = async (userId: string) => {
  return db.query.profile.findFirst({
    where: eq(profile.userId, userId),
  });
};

/** Every user's stored image URLs — the source of truth for upload GC. */
export const getProfileImageReferences = async () => {
  return db
    .select({ userId: user.id, image: user.image, bannerImage: profile.bannerImage })
    .from(user)
    .leftJoin(profile, eq(profile.userId, user.id));
};
