export function getAnimeTitle(anime: {
  titleEnglish?: string | null;
  titleRomaji?: string | null;
  titleNative?: string | null;
}): string {
  return anime.titleEnglish || anime.titleRomaji || anime.titleNative || "Unknown Title";
}

export function getAnimeCoverImage(anime: {
  coverImageExtraLarge?: string | null;
  coverImageLarge?: string | null;
}): string {
  return anime.coverImageExtraLarge || anime.coverImageLarge || "";
}

export function getAnimeBannerImage(anime: {
  bannerImage?: string | null;
  coverImageExtraLarge?: string | null;
  coverImageLarge?: string | null;
}): string {
  return anime.bannerImage || getAnimeCoverImage(anime);
}
