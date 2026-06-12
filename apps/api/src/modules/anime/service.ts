import type { Anime } from "./model";

const ANILIST_API_URL = "https://graphql.anilist.co";

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

export class AnilistService {
  async getTrending(): Promise<Anime[]> {
    const response = await fetch(ANILIST_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ query: TRENDING_ANIME_QUERY }),
    });

    if (!response.ok) {
      throw new Error(`AniList API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data?.data?.Page?.media || [];
  }
}
