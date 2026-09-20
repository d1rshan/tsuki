import { readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";

import {
  KITSU_FORMAT_MAP,
  KITSU_STATUS_MAP,
  type KitsuIncluded,
  type KitsuMedia,
} from "../../src/types";
import { toMediaCompactRow, toMediaRow } from "../../src/api/mappers";

const animeFixture = JSON.parse(
  readFileSync(new URL("../fixtures/anime-1.json", import.meta.url), "utf8"),
) as { data: KitsuMedia; included: KitsuIncluded[] };

const mangaFixture = JSON.parse(
  readFileSync(new URL("../fixtures/manga-1.json", import.meta.url), "utf8"),
) as { data: KitsuMedia; included: KitsuIncluded[] };

describe("toMediaRow", () => {
  test("maps the Cowboy Bebop fixture", () => {
    const row = toMediaRow(animeFixture.data, animeFixture.included);

    expect(row).toMatchObject({
      id: 1,
      type: "ANIME",
      titleRomaji: "Cowboy Bebop",
      titleEnglish: "Cowboy Bebop",
      titleNative: "カウボーイビバップ",
      format: "TV",
      status: "FINISHED",
      episodes: 26,
      duration: 25,
      chapters: null,
      volumes: null,
      startDate: { year: 1998, month: 4, day: 3 },
      endDate: { year: 1999, month: 4, day: 24 },
      seasonYear: 1998,
      averageScore: 82, // "82.27" rounds down
      popularity: 162331,
      favourites: 5167,
      trailer: { id: "qig4KOK2R2g", site: "youtube" },
      slug: "cowboy-bebop",
      nsfw: false,
      coverImageColor: null,
    });
  });

  test("maps the Guardian Dog manga fixture with the romaji fallback chain", () => {
    const row = toMediaRow(mangaFixture.data, mangaFixture.included);

    // titles.en is absent; en_jp carries the romaji title instead.
    expect(row).toMatchObject({
      id: 1,
      type: "MANGA",
      titleRomaji: "Guardian Dog",
      titleEnglish: null,
      chapters: 22,
      volumes: 4,
      episodes: null,
      duration: null,
      format: "MANGA",
      status: "FINISHED",
      startDate: { year: 2005, month: 1, day: 1 },
      seasonYear: 2005,
      averageScore: 71,
      slug: "guardian-dog",
      nsfw: false,
      // coverImage is null on this manga, so no banner.
      bannerImage: null,
      trailer: null,
      externalLinks: null,
    });
  });

  test("derives genres from included categories", () => {
    const row = toMediaRow(animeFixture.data, animeFixture.included);

    expect(row.genres).toContain("Science Fiction");
    expect(row.genres?.length).toBeLessThanOrEqual(20);
  });

  test("resolves streaming links into externalLinks, generic label without a streamer", () => {
    const row = toMediaRow(animeFixture.data, animeFixture.included);

    expect(row.externalLinks).toEqual([
      { site: "streaming", url: "https://www.amazon.com/gp/video/detail/B06VW8K7ZJ/" },
      { site: "streaming", url: "http://www.crunchyroll.com/cowboy-bebop" },
      { site: "streaming", url: "https://www.hulu.com/cowboy-bebop" },
      { site: "streaming", url: "http://tubitv.com/series/2052/cowboy_bebop" },
    ]);
  });
});

describe("status and subtype mapping for every kitsu value", () => {
  const withAnimeAttributes = (overrides: Record<string, unknown>) =>
    ({
      ...animeFixture.data,
      attributes: { ...animeFixture.data.attributes, ...overrides },
    }) as KitsuMedia;
  const withMangaAttributes = (overrides: Record<string, string>) =>
    ({
      ...mangaFixture.data,
      attributes: { ...mangaFixture.data.attributes, ...overrides },
    }) as KitsuMedia;

  test("the mapping tables cover every documented kitsu value", () => {
    expect(Object.keys(KITSU_STATUS_MAP).sort()).toEqual([
      "current",
      "finished",
      "tba",
      "unreleased",
      "upcoming",
    ]);
    expect(Object.keys(KITSU_FORMAT_MAP).sort()).toEqual([
      "doujin",
      "lightnovel",
      "manga",
      "manhua",
      "manhwa",
      "movie",
      "music",
      "novel",
      "oel",
      "ona",
      "oneshot",
      "ova",
      "special",
      "tv",
    ]);
  });

  test("every anime subtype maps", () => {
    for (const [subtype, format] of [
      ["TV", "TV"],
      ["movie", "MOVIE"],
      ["OVA", "OVA"],
      ["ONA", "ONA"],
      ["special", "SPECIAL"],
      ["music", "MUSIC"],
    ] as const) {
      expect(toMediaRow(withAnimeAttributes({ subtype })).format).toBe(format);
    }
  });

  test("every mangaType maps", () => {
    for (const [mangaType, format] of [
      ["manga", "MANGA"],
      ["doujin", "MANGA"],
      ["manhua", "MANGA"],
      ["manhwa", "MANGA"],
      ["oel", "MANGA"],
      ["lightNovel", "NOVEL"],
      ["novel", "NOVEL"],
      ["oneshot", "ONE_SHOT"],
    ] as const) {
      expect(toMediaRow(withMangaAttributes({ mangaType })).format).toBe(format);
    }
  });

  test("every status maps", () => {
    for (const [status, mediaStatus] of [
      ["current", "RELEASING"],
      ["finished", "FINISHED"],
      ["upcoming", "NOT_YET_RELEASED"],
      ["tba", "NOT_YET_RELEASED"],
      ["unreleased", "NOT_YET_RELEASED"],
    ] as const) {
      expect(toMediaRow(withAnimeAttributes({ status })).status).toBe(mediaStatus);
    }
  });
});

describe("genre dedupe and NSFW exclusion", () => {
  test("dedupes case-insensitively and drops isNsfw categories", () => {
    // Synthetic categories must be wired into the media's own relationship
    // ids — resolution is scoped to them, not to the whole `included`.
    const withSyntheticCategories = {
      ...animeFixture.data,
      relationships: {
        ...animeFixture.data.relationships,
        categories: {
          data: [
            ...(animeFixture.data.relationships!.categories!.data! as {
              id: string;
              type: string;
            }[]),
            { id: "900", type: "categories" },
            { id: "901", type: "categories" },
          ],
        },
      },
    } as KitsuMedia;

    const row = toMediaRow(withSyntheticCategories, [
      ...animeFixture.included,
      { id: "900", type: "categories", attributes: { title: "ACTION" } },
      { id: "901", type: "categories", attributes: { title: "Hentai", isNsfw: true } },
    ] satisfies KitsuIncluded[]);

    expect(row.genres).toContain("Action");
    expect(row.genres?.filter((genre) => genre.toLowerCase() === "action")).toHaveLength(1);
    expect(row.genres).not.toContain("Hentai");
  });
});

describe("toMediaCompactRow", () => {
  test("carries the trimmed selection for grids and cards", () => {
    expect(toMediaCompactRow(animeFixture.data)).toEqual({
      id: 1,
      type: "ANIME",
      titleRomaji: "Cowboy Bebop",
      titleEnglish: "Cowboy Bebop",
      titleNative: "カウボーイビバップ",
      coverImageExtraLarge: "https://media.kitsu.app/anime/poster_images/1/large.jpg",
      coverImageLarge: "https://media.kitsu.app/anime/poster_images/1/medium.jpg",
      coverImageColor: null,
      bannerImage:
        "https://media.kitsu.app/anime/1/cover_image/large-88da0208ac7fdd1a978de8b539008bd8.jpeg",
      format: "TV",
      episodes: 26,
      chapters: null,
      seasonYear: 1998,
      averageScore: 82,
    });
  });
});
