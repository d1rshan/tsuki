import { gql } from "graphql-request";
import type { AnilistMediaManga } from "../types";

export const SEARCH_MANGA_QUERY = gql`
  query SearchManga($search: String, $isAdult: Boolean) {
    Page(page: 1, perPage: 24) {
      media(search: $search, type: MANGA, sort: SEARCH_MATCH, isAdult: $isAdult) {
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
        chapters
        seasonYear
        averageScore
      }
    }
  }
`;

export type AnilistMangaSearchResponse = {
  Page?: {
    media?: AnilistMediaManga[];
  };
};
