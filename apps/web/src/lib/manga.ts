export function getMangaTitle(manga: {
  titleEnglish?: string | null;
  titleRomaji?: string | null;
  titleNative?: string | null;
}): string {
  return manga.titleEnglish || manga.titleRomaji || manga.titleNative || "Unknown Title";
}

export function getMangaCoverImage(manga: {
  coverImageExtraLarge?: string | null;
  coverImageLarge?: string | null;
}): string {
  return manga.coverImageExtraLarge || manga.coverImageLarge || "";
}

export function getMangaBannerImage(manga: {
  bannerImage?: string | null;
  coverImageExtraLarge?: string | null;
  coverImageLarge?: string | null;
}): string {
  return manga.bannerImage || getMangaCoverImage(manga);
}
