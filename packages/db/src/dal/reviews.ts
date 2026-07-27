import { eq, and } from "drizzle-orm";

import { db } from "../db";
import { userReviews, userMangaReviews } from "../schema";

type InsertReview = typeof userReviews.$inferInsert;
type InsertMangaReview = typeof userMangaReviews.$inferInsert;

export const createReview = async (review: InsertReview) => {
  const [result] = await db.insert(userReviews).values(review).returning();
  return result;
};

export const updateReview = async (
  id: string,
  data: { content?: string; containsSpoilers?: boolean },
) => {
  const [result] = await db.update(userReviews).set(data).where(eq(userReviews.id, id)).returning();
  return result;
};

export const getReviewForAnime = async (userId: string, animeId: number) => {
  return db.query.userReviews.findFirst({
    where: and(eq(userReviews.userId, userId), eq(userReviews.animeId, animeId)),
  });
};

export const getUserReviews = async (userId: string) => {
  return db.query.userReviews.findMany({
    where: eq(userReviews.userId, userId),
    with: {
      anime: {
        columns: {
          id: true,
          titleRomaji: true,
          titleEnglish: true,
          titleNative: true,
          coverImageExtraLarge: true,
          coverImageLarge: true,
          coverImageColor: true,
        },
      },
    },
    orderBy: (reviews, { desc }) => [desc(reviews.createdAt)],
  });
};

export const createMangaReview = async (review: InsertMangaReview) => {
  const [result] = await db.insert(userMangaReviews).values(review).returning();
  return result;
};

export const updateMangaReview = async (
  id: string,
  data: { content?: string; containsSpoilers?: boolean },
) => {
  const [result] = await db
    .update(userMangaReviews)
    .set(data)
    .where(eq(userMangaReviews.id, id))
    .returning();
  return result;
};

export const getReviewForManga = async (userId: string, mangaId: number) => {
  return db.query.userMangaReviews.findFirst({
    where: and(eq(userMangaReviews.userId, userId), eq(userMangaReviews.mangaId, mangaId)),
  });
};

export const getUserMangaReviews = async (userId: string) => {
  return db.query.userMangaReviews.findMany({
    where: eq(userMangaReviews.userId, userId),
    with: {
      manga: {
        columns: {
          id: true,
          titleRomaji: true,
          titleEnglish: true,
          titleNative: true,
          coverImageExtraLarge: true,
          coverImageLarge: true,
          coverImageColor: true,
        },
      },
    },
    orderBy: (reviews, { desc }) => [desc(reviews.createdAt)],
  });
};
