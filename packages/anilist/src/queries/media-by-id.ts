import { gql } from "graphql-request";

import type { AnilistMedia } from "../types";
import { MEDIA_FIELDS } from "./fragments";

export const MEDIA_BY_ID_QUERY = gql`
  ${MEDIA_FIELDS}
  query GetMediaById($id: Int, $type: MediaType) {
    Media(id: $id, type: $type) {
      ...MediaFields
    }
  }
`;

export type MediaByIdResponse = {
  Media?: AnilistMedia;
};
