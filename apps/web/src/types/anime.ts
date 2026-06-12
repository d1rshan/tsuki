export type AnimeTitle = {
  romaji: string;
  english: string | null;
};

export type AnimeCoverImage = {
  large: string;
};

export type Anime = {
  id: number;
  title: AnimeTitle;
  coverImage: AnimeCoverImage;
};
