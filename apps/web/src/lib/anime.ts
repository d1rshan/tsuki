import { type Anime } from "@/types/anime";

export function getAnimeTitle(anime: Partial<Anime>): string {
  return anime.titleEnglish || anime.titleRomaji || anime.titleNative || "Unknown Title";
}

export function getAnimeCoverImage(anime: Partial<Anime>): string {
  return anime.coverImageExtraLarge || anime.coverImageLarge || "";
}

export function getAnimeBannerImage(anime: Partial<Anime>): string {
  return anime.bannerImage || getAnimeCoverImage(anime);
}
