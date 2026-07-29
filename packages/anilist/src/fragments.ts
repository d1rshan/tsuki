import { gql } from "graphql-request";

/** One selection serves both types — the other's fields just come back null. */
export const MEDIA_FIELDS = gql`
  fragment MediaFields on Media {
    id
    idMal
    type
    title {
      romaji
      english
      native
    }
    synonyms
    description
    coverImage {
      extraLarge
      large
      medium
      color
    }
    bannerImage
    format
    status
    source
    countryOfOrigin
    episodes
    duration
    chapters
    volumes
    startDate {
      year
      month
      day
    }
    endDate {
      year
      month
      day
    }
    season
    seasonYear
    averageScore
    meanScore
    popularity
    favourites
    genres
    tags {
      id
      name
      category
      rank
      isGeneralSpoiler
      isMediaSpoiler
      isAdult
    }
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
    siteUrl
    isAdult
  }
`;

/** The trimmed selection behind search results and grids. */
export const MEDIA_COMPACT_FIELDS = gql`
  fragment MediaCompactFields on Media {
    id
    type
    title {
      romaji
      english
      native
    }
    coverImage {
      extraLarge
      large
      color
    }
    bannerImage
    format
    episodes
    chapters
    seasonYear
    averageScore
  }
`;
