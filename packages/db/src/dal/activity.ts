import { eq, and } from "drizzle-orm";

import { db } from "../db";
import { userAnimeLibrary, userReviews, userMangaLibrary, userMangaReviews } from "../schema";

type InsertLibraryEntry = typeof userAnimeLibrary.$inferInsert;
type InsertReview = typeof userReviews.$inferInsert;
type InsertMangaLibraryEntry = typeof userMangaLibrary.$inferInsert;
type InsertMangaReview = typeof userMangaReviews.$inferInsert;

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

export const upsertMangaLibraryEntry = async (entry: InsertMangaLibraryEntry) => {
  const [result] = await db
    .insert(userMangaLibrary)
    .values(entry)
    .onConflictDoUpdate({
      target: [userMangaLibrary.userId, userMangaLibrary.mangaId],
      set: {
        status: entry.status,
        rating: entry.rating,
        chaptersRead: entry.chaptersRead,
        isFavorite: entry.isFavorite,
      },
    })
    .returning();
  return result;
};

export const deleteMangaLibraryEntry = async (userId: string, mangaId: number) => {
  return db
    .delete(userMangaLibrary)
    .where(and(eq(userMangaLibrary.userId, userId), eq(userMangaLibrary.mangaId, mangaId)));
};

export const getUserMangaLibrary = async (userId: string) => {
  return db.query.userMangaLibrary.findMany({
    where: eq(userMangaLibrary.userId, userId),
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
          chapters: true,
          format: true,
        },
      },
    },
    orderBy: (library, { desc }) => [desc(library.updatedAt)],
  });
};

export const getMangaLibraryEntry = async (userId: string, mangaId: number) => {
  return db.query.userMangaLibrary.findFirst({
    where: and(eq(userMangaLibrary.userId, userId), eq(userMangaLibrary.mangaId, mangaId)),
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
