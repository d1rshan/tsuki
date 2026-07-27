import { gql } from "graphql-request";

import type { AnilistMediaCompact } from "../types";
import { MEDIA_COMPACT_FIELDS } from "./fragments";

export const SEARCH_MEDIA_QUERY = gql`
  ${MEDIA_COMPACT_FIELDS}
  query SearchMedia($search: String, $type: MediaType, $isAdult: Boolean) {
    Page(page: 1, perPage: 24) {
      media(search: $search, type: $type, sort: SEARCH_MATCH, isAdult: $isAdult) {
        ...MediaCompactFields
      }
    }
  }
`;

export type SearchMediaResponse = {
  Page?: {
    media?: (AnilistMediaCompact | null)[];
  };
};
