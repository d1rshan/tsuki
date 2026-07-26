import { gql } from "graphql-request";
import type { AnilistMediaManga } from "../types";

export const TRENDING_MANGA_QUERY = gql`
  query ($page: Int = 1, $perPage: Int = 50) {
    Page(page: $page, perPage: $perPage) {
      media(type: MANGA, sort: TRENDING_DESC, isAdult: false) {
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
        chapters
        volumes
        season
        seasonYear
        averageScore
        meanScore
        popularity
        trending
        genres
        trailer {
          id
          site
          thumbnail
        }
        externalLinks {
          url
          site
          type
          color
          icon
        }
        isAdult
      }
    }
  }
`;

export type TrendingMangaQueryResponse = {
  Page?: {
    media?: AnilistMediaManga[];
  };
};
