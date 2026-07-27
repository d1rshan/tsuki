import { gql } from "graphql-request";
import type { AnilistMediaManga } from "../types";

export const MANGA_BY_ID_QUERY = gql`
  query GetMangaById($id: Int) {
    Media(id: $id, type: MANGA) {
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
`;

export type MangaByIdResponse = {
  Media?: AnilistMediaManga;
};
