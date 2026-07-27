/**
 * Payload shapes for the jsonb columns.
 *
 * These mirror what AniList returns, but are declared here so the db package
 * carries no dependency on any upstream client — storage should not know which
 * API filled it. Divergence is not silent: mapper output meets these types at
 * `upsertMedia`, so a mismatch fails to compile at the call site.
 */

/** A date where any component may be unknown. */
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
