import type { AnilistMedia } from "./types";

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
    tags: anime.tags,
    isAdult: anime.isAdult ?? false,
  };
}
