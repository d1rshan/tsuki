import type { AnilistMedia, AnilistMediaManga } from "./types";

export function toAnimeRow(anime: AnilistMedia) {
  return {
    id: anime.id,
    titleRomaji: anime.title.romaji,
    titleEnglish: anime.title.english,
    titleNative: anime.title.native,
    description: anime.description,
    coverImageExtraLarge: anime.coverImage.extraLarge,
    coverImageLarge: anime.coverImage.large,
    coverImageColor: anime.coverImage.color,
    bannerImage: anime.bannerImage,
    format: anime.format,
    status: anime.status,
    episodes: anime.episodes,
    duration: anime.duration,
    season: anime.season,
    seasonYear: anime.seasonYear,
    averageScore: anime.averageScore,
    meanScore: anime.meanScore,
    popularity: anime.popularity,
    trending: anime.trending,
    genres: anime.genres?.filter((g): g is string => g != null) ?? null,
    trailer: anime.trailer,
    externalLinks: anime.externalLinks,
    isAdult: anime.isAdult ?? false,
  };
}

// TODO: Partial here?
export function toAnimeCompactRow(anime: Partial<AnilistMedia> & { id: number }) {
  return {
    id: anime.id,
    titleRomaji: anime.title?.romaji,
    titleEnglish: anime.title?.english,
    titleNative: anime.title?.native,
    coverImageExtraLarge: anime.coverImage?.extraLarge,
    coverImageLarge: anime.coverImage?.large,
    bannerImage: anime.bannerImage,
    seasonYear: anime.seasonYear,
    episodes: anime.episodes,
    averageScore: anime.averageScore,
  };
}

export function toMangaRow(manga: AnilistMediaManga) {
  return {
    id: manga.id,
    titleRomaji: manga.title.romaji,
    titleEnglish: manga.title.english,
    titleNative: manga.title.native,
    description: manga.description,
    coverImageExtraLarge: manga.coverImage.extraLarge,
    coverImageLarge: manga.coverImage.large,
    coverImageColor: manga.coverImage.color,
    bannerImage: manga.bannerImage,
    format: manga.format,
    status: manga.status,
    chapters: manga.chapters,
    volumes: manga.volumes,
    season: manga.season,
    seasonYear: manga.seasonYear,
    averageScore: manga.averageScore,
    meanScore: manga.meanScore,
    popularity: manga.popularity,
    trending: manga.trending,
    genres: manga.genres?.filter((g): g is string => g != null) ?? null,
    trailer: manga.trailer,
    externalLinks: manga.externalLinks,
    isAdult: manga.isAdult ?? false,
  };
}

export function toMangaCompactRow(manga: Partial<AnilistMediaManga> & { id: number }) {
  return {
    id: manga.id,
    titleRomaji: manga.title?.romaji,
    titleEnglish: manga.title?.english,
    titleNative: manga.title?.native,
    coverImageExtraLarge: manga.coverImage?.extraLarge,
    coverImageLarge: manga.coverImage?.large,
    bannerImage: manga.bannerImage,
    seasonYear: manga.seasonYear,
    chapters: manga.chapters,
    averageScore: manga.averageScore,
  };
}
