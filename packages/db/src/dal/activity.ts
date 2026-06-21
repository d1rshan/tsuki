import { eq, and } from "drizzle-orm";

import { db } from "../db";
import { userAnimeLibrary, userReviews } from "../schema";

type InsertLibraryEntry = typeof userAnimeLibrary.$inferInsert;
type InsertReview = typeof userReviews.$inferInsert;

export const upsertLibraryEntry = async (entry: InsertLibraryEntry) => {
  const [result] = await db
    .insert(userAnimeLibrary)
    .values(entry)
    .onConflictDoUpdate({
      target: [userAnimeLibrary.userId, userAnimeLibrary.animeId],
      set: {
        status: entry.status,
        rating: entry.rating,
        episodesWatched: entry.episodesWatched,
        isFavorite: entry.isFavorite,
      },
    })
    .returning();
  return result;
};

export const deleteLibraryEntry = async (userId: string, animeId: number) => {
  return db
    .delete(userAnimeLibrary)
    .where(and(eq(userAnimeLibrary.userId, userId), eq(userAnimeLibrary.animeId, animeId)));
};

export const getUserLibrary = async (userId: string) => {
  return db.query.userAnimeLibrary.findMany({
    where: eq(userAnimeLibrary.userId, userId),
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
          episodes: true,
          format: true,
        },
      },
    },
    orderBy: (library, { desc }) => [desc(library.updatedAt)],
  });
};

export const getLibraryEntry = async (userId: string, animeId: number) => {
  return db.query.userAnimeLibrary.findFirst({
    where: and(eq(userAnimeLibrary.userId, userId), eq(userAnimeLibrary.animeId, animeId)),
  });
};

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
