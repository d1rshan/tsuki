import { eq, sql } from "drizzle-orm";

import { db } from "../db";
import { followRequest, profile, social, user } from "../schema";

/**
 * Profile fields, avatar, privacy and pending-follow approvals commit together.
 * neon-http uses a transactional batch instead of interactive transactions.
 */
export const updateUserProfile = async (
  userId: string,
  data: Partial<Pick<typeof profile.$inferInsert, "bio" | "bannerImage" | "socialLinks">>,
  userData: Partial<Pick<typeof user.$inferInsert, "image" | "isPrivate">> = {},
) => {
  const values = data.socialLinks === null ? { ...data, socialLinks: {} } : data;
  const [userRows, profileRows] = await db.batch([
    db
      .update(user)
      .set({ ...userData, updatedAt: new Date() })
      .where(eq(user.id, userId))
      .returning(),
    db
      .insert(profile)
      .values({ userId, ...values })
      .onConflictDoUpdate({ target: profile.userId, set: { ...values, updatedAt: new Date() } })
      .returning(),
    ...(userData.isPrivate === false
      ? [
          db.execute(sql`
        with approved as (
          delete from ${followRequest}
          where ${followRequest.targetId} = ${userId}
          returning requester_id, target_id
        )
        insert into ${social} (follower_id, following_id)
        select requester_id, target_id from approved
        on conflict do nothing
      `),
        ]
      : []),
  ]);
  return {
    profile: profileRows[0] ?? null,
    image: userRows[0]?.image ?? null,
    isPrivate: userRows[0]?.isPrivate ?? false,
  };
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
