// Payload shapes for the jsonb columns
// (These mirror what the provider mapper produces)

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
  site: string;
  url: string;
};
