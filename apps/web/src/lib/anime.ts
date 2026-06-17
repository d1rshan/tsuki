import { type AnimeCompact } from "@/types/anime";

export function getAnimeTitle(anime: AnimeCompact): string {
  return anime.titleEnglish || anime.titleRomaji || anime.titleNative || "Unknown Title";
}

export function getAnimeCoverImage(anime: AnimeCompact): string {
  return anime.coverImageExtraLarge || anime.coverImageLarge || "";
}

export function getAnimeBannerImage(anime: AnimeCompact): string {
  return anime.bannerImage || getAnimeCoverImage(anime);
}
