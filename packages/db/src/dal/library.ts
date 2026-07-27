import { eq, and } from "drizzle-orm";

import { db } from "../db";
import { userAnimeLibrary, userMangaLibrary } from "../schema";

type InsertLibraryEntry = typeof userAnimeLibrary.$inferInsert;
type InsertMangaLibraryEntry = typeof userMangaLibrary.$inferInsert;

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
