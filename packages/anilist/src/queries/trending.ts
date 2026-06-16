import { gql } from "graphql-request";
import type { AnilistMedia } from "../types";

export const TRENDING_ANIME_QUERY = gql`
  query {
    Page(page: 1, perPage: 50) {
      media(type: ANIME, sort: TRENDING_DESC) {
        id
        title {
          romaji
          english
          native
        }
        description
        coverImage {
          extraLarge
          large
          color
        }
        bannerImage
        format
        status
        episodes
        duration
        season
        seasonYear
        averageScore
        meanScore
        popularity
        trending
        genres
        tags {
          name
          rank
        }
        isAdult
      }
    }
  }
`;

export type TrendingQueryResponse = {
  Page?: {
    media?: AnilistMedia[];
  };
};
