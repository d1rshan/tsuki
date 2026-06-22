import { gql } from "graphql-request";
import type { AnilistMedia } from "../types";

export const ANIME_BY_ID_QUERY = gql`
  query GetAnimeById($id: Int) {
    Media(id: $id, type: ANIME) {
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
`;

export type AnimeByIdResponse = {
  Media?: AnilistMedia;
};
