import { gql } from "graphql-request";
import type { AnilistMedia } from "../types";

export const SEARCH_ANIME_QUERY = gql`
  query SearchAnime($search: String) {
    Page(page: 1, perPage: 24) {
      media(search: $search, type: ANIME, sort: SEARCH_MATCH) {
        id
        title {
          romaji
          english
          native
        }
        coverImage {
          extraLarge
          large
        }
        bannerImage
        episodes
        seasonYear
        averageScore
      }
    }
  }
`;

export type AnilistSearchResponse = {
  Page?: {
    media?: AnilistMedia[];
  };
};
