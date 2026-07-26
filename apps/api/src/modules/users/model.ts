import { t } from "elysia";

const WatchStatusEnum = t.Enum({
  WATCHING: "WATCHING",
  COMPLETED: "COMPLETED",
  PLAN_TO_WATCH: "PLAN_TO_WATCH",
  DROPPED: "DROPPED",
  PAUSED: "PAUSED",
});

const ReadStatusEnum = t.Enum({
  READING: "READING",
  COMPLETED: "COMPLETED",
  PLAN_TO_READ: "PLAN_TO_READ",
  DROPPED: "DROPPED",
  PAUSED: "PAUSED",
});

export const LibraryEntryModel = t.Object({
  status: t.Optional(WatchStatusEnum),
  rating: t.Optional(t.Number()),
  episodesWatched: t.Optional(t.Number()),
  isFavorite: t.Optional(t.Boolean()),
});

export const MangaLibraryEntryModel = t.Object({
  status: t.Optional(ReadStatusEnum),
  rating: t.Optional(t.Number()),
  chaptersRead: t.Optional(t.Number()),
  isFavorite: t.Optional(t.Boolean()),
});

export const ReviewModel = t.Object({
  content: t.String(),
  containsSpoilers: t.Optional(t.Boolean()),
});

export const LibraryAnimeModel = t.Object({
  id: t.Number(),
  titleRomaji: t.Nullable(t.String()),
  titleEnglish: t.Nullable(t.String()),
  titleNative: t.Nullable(t.String()),
  coverImageExtraLarge: t.Nullable(t.String()),
  coverImageLarge: t.Nullable(t.String()),
  coverImageColor: t.Nullable(t.String()),
  episodes: t.Optional(t.Nullable(t.Number())),
  format: t.Optional(t.Nullable(t.String())),
});

export const LibraryMangaModel = t.Object({
  id: t.Number(),
  titleRomaji: t.Nullable(t.String()),
  titleEnglish: t.Nullable(t.String()),
  titleNative: t.Nullable(t.String()),
  coverImageExtraLarge: t.Nullable(t.String()),
  coverImageLarge: t.Nullable(t.String()),
  coverImageColor: t.Nullable(t.String()),
  chapters: t.Optional(t.Nullable(t.Number())),
  format: t.Optional(t.Nullable(t.String())),
});

export const LibraryEntryResponseModel = t.Object({
  userId: t.String(),
  animeId: t.Number(),
  status: t.Nullable(WatchStatusEnum),
  rating: t.Nullable(t.Number()),
  episodesWatched: t.Number(),
  isFavorite: t.Boolean(),
  createdAt: t.Date(),
  updatedAt: t.Date(),
  anime: t.Optional(LibraryAnimeModel),
});

export const MangaLibraryEntryResponseModel = t.Object({
  userId: t.String(),
  mangaId: t.Number(),
  status: t.Nullable(ReadStatusEnum),
  rating: t.Nullable(t.Number()),
  chaptersRead: t.Number(),
  isFavorite: t.Boolean(),
  createdAt: t.Date(),
  updatedAt: t.Date(),
  manga: t.Optional(LibraryMangaModel),
});

export const ReviewResponseModel = t.Object({
  id: t.String(),
  userId: t.String(),
  animeId: t.Number(),
  content: t.String(),
  containsSpoilers: t.Boolean(),
  createdAt: t.Date(),
  updatedAt: t.Date(),
  anime: t.Optional(LibraryAnimeModel),
});

export const MangaReviewResponseModel = t.Object({
  id: t.String(),
  userId: t.String(),
  mangaId: t.Number(),
  content: t.String(),
  containsSpoilers: t.Boolean(),
  createdAt: t.Date(),
  updatedAt: t.Date(),
  manga: t.Optional(LibraryMangaModel),
});

export const UserActivityResponseModel = t.Object({
  entry: t.Nullable(LibraryEntryResponseModel),
  review: t.Nullable(ReviewResponseModel),
});

export const MangaUserActivityResponseModel = t.Object({
  entry: t.Nullable(MangaLibraryEntryResponseModel),
  review: t.Nullable(MangaReviewResponseModel),
});

export const ProfileModel = t.Object({
  bio: t.Nullable(t.String({ maxLength: 500 })),
  bannerImage: t.Nullable(t.String({ pattern: "^https?://" })),
  accentColor: t.Nullable(t.String({ pattern: "^#[0-9a-fA-F]{6}$" })),
  socialLinks: t.Nullable(t.Record(t.String(), t.String({ pattern: "^https?://" }))),
});

export const UpdateProfileModel = t.Partial(ProfileModel);

export const UserOverviewResponseModel = t.Object({
  user: t.Object({
    id: t.String(),
    name: t.String(),
    username: t.String(),
    displayUsername: t.String(),
    image: t.Nullable(t.String()),
    createdAt: t.Date(),
  }),
  profile: t.Nullable(ProfileModel),
  stats: t.Object({
    totalAnime: t.Number(),
    episodesWatched: t.Number(),
    meanScore: t.Number(),
    totalManga: t.Number(),
    chaptersRead: t.Number(),
    mangaMeanScore: t.Number(),
  }),
  favorites: t.Array(LibraryEntryResponseModel),
  recentLogs: t.Array(LibraryEntryResponseModel),
  recentReviews: t.Array(ReviewResponseModel),
  mangaFavorites: t.Array(MangaLibraryEntryResponseModel),
  recentMangaLogs: t.Array(MangaLibraryEntryResponseModel),
  recentMangaReviews: t.Array(MangaReviewResponseModel),
});

export type WatchStatus = typeof WatchStatusEnum.static;
export type ReadStatus = typeof ReadStatusEnum.static;
export type LibraryEntry = typeof LibraryEntryResponseModel.static;
export type MangaLibraryEntry = typeof MangaLibraryEntryResponseModel.static;
export type Review = typeof ReviewResponseModel.static;
export type MangaReview = typeof MangaReviewResponseModel.static;
export type UserOverview = typeof UserOverviewResponseModel.static;
