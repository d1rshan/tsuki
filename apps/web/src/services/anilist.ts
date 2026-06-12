import { type Anime } from "@/types/anime";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/graphql";

const TRENDING_ANIME_QUERY = `
  query {
    Page(page: 1, perPage: 12) {
      media(type: ANIME, sort: TRENDING_DESC) {
        id
        title {
          romaji
          english
        }
        coverImage {
          large
        }
      }
    }
  }
`;

export async function getTrendingAnime(): Promise<Anime[]> {
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: TRENDING_ANIME_QUERY }),
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch from API: ${res.statusText}`);
    }

    const data = await res.json();
    return data?.data?.Page?.media || [];
  } catch (error) {
    console.error("[AniList Service Error]:", error);
    return [];
  }
}
