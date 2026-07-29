import { gql } from "graphql-request";

import { MEDIA_COMPACT_FIELDS, MEDIA_FIELDS } from "./fragments";
import type { AnilistMedia, AnilistMediaCompact } from "../types";

type PageOf<T> = { Page?: { media?: (T | null)[] } };

export const MEDIA_BY_ID_QUERY = gql`
  ${MEDIA_FIELDS}
  query GetMediaById($id: Int, $type: MediaType) {
    Media(id: $id, type: $type) {
      ...MediaFields
    }
  }
`;

export type MediaByIdResponse = { Media?: AnilistMedia | null };

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

export type SearchMediaResponse = PageOf<AnilistMediaCompact>;

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

export type TrendingMediaResponse = PageOf<AnilistMedia>;
