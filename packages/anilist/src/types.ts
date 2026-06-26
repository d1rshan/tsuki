export type MediaStatus = "FINISHED" | "RELEASING" | "NOT_YET_RELEASED" | "CANCELLED" | "HIATUS";

export type AnilistMedia = {
  id: number;
  title: { romaji: string | null; english: string | null; native: string | null };
  description: string | null;
  coverImage: { extraLarge: string | null; large: string | null; color: string | null };
  bannerImage: string | null;
  format: string | null;
  status: MediaStatus | null;
  episodes: number | null;
  duration: number | null;
  season: string | null;
  seasonYear: number | null;
  averageScore: number | null;
  meanScore: number | null;
  popularity: number | null;
  trending: number | null;
  genres: (string | null)[] | null;
  trailer: { id: string; site: string; thumbnail: string } | null;
  externalLinks:
    | { url: string; site: string; type: string; color: string | null; icon: string | null }[]
    | null;
  isAdult: boolean | null;
};
