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
