import { gql } from "graphql-request";

import type { AnilistMedia } from "../types";
import { MEDIA_FIELDS } from "./fragments";

export const TRENDING_MEDIA_QUERY = gql`
  ${MEDIA_FIELDS}
  query Trending($type: MediaType, $page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      media(type: $type, sort: TRENDING_DESC, isAdult: false) {
        ...MediaFields
      }
    }
  }
`;

export type TrendingMediaResponse = {
  Page?: {
    media?: (AnilistMedia | null)[];
  };
};
