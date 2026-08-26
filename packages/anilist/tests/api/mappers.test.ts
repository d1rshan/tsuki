import { describe, expect, test } from "vitest";

import type { AnilistMedia } from "../../src/types";

import { toMediaRow } from "../../src/api/mappers";

const media = {
  id: 21,
  type: "ANIME",
  title: { romaji: "One Piece", english: "One Piece", native: "ONE PIECE" },
  description: "Pirates",
  coverImage: { extraLarge: null, large: null, color: null },
  bannerImage: null,
  format: "TV",
  status: "RELEASING",
  source: "MANGA",
  countryOfOrigin: "JP",
  episodes: null,
  duration: 24,
  chapters: null,
  volumes: null,
  startDate: { year: 1999, month: 10, day: null },
  endDate: { year: null, month: null, day: null },
  season: "FALL",
  seasonYear: 1999,
  averageScore: 88,
  popularity: 800_000,
  favourites: 50_000,
  genres: ["Adventure", null],
  trailer: null,
  externalLinks: [null],
} satisfies AnilistMedia;

describe("toMediaRow", () => {
  test("preserves partial dates and normalizes empty AniList values", () => {
    expect(toMediaRow(media)).toMatchObject({
      startDate: { year: 1999, month: 10, day: null },
      endDate: null,
      genres: ["Adventure"],
      externalLinks: null,
    });
  });
});
