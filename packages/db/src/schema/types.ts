// Payload shapes for the jsonb columns
// (These mirror what AniList returns)

// date where any component may be unknown
export type FuzzyDate = {
  year: number | null;
  month: number | null;
  day: number | null;
};

export type MediaTrailer = {
  id: string;
  site: string;
  thumbnail: string;
};

export type MediaExternalLink = {
  url: string;
  site: string;
  type: string;
  /** Optional for links cached before AniList's language metadata was stored. */
  language?: string | null;
  color: string | null;
  icon: string | null;
};

export type MediaTag = {
  id: number;
  name: string;
  category: string | null;
  rank: number | null;
  isGeneralSpoiler: boolean;
  isMediaSpoiler: boolean;
  isAdult: boolean;
};
