import { describe, expect, test } from "bun:test";

import {
  formatCountry,
  formatExternalLinks,
  formatFuzzyDate,
  formatMediaSource,
  mediaDescriptionText,
  mediaImageClass,
  parseMediaId,
} from "./media";
import { mediaIdSchema } from "./schemas";

describe("parseMediaId", () => {
  test("accepts positive integer route IDs", () => {
    expect(parseMediaId("21")).toBe(21);
  });

  test("rejects invalid route IDs", () => {
    expect(parseMediaId("0")).toBeNull();
    expect(parseMediaId("01")).toBeNull();
    expect(parseMediaId("1.5")).toBeNull();
    expect(parseMediaId("1e3")).toBeNull();
    expect(parseMediaId("0x15")).toBeNull();
    expect(parseMediaId("2147483648")).toBeNull();
    expect(parseMediaId("not-a-number")).toBeNull();
  });
});

describe("mediaIdSchema", () => {
  test("rejects IDs outside the database integer range", () => {
    expect(mediaIdSchema.safeParse(2_147_483_647).success).toBe(true);
    expect(mediaIdSchema.safeParse(2_147_483_648).success).toBe(false);
  });
});

describe("mediaDescriptionText", () => {
  test("preserves readable line breaks and decodes common entities", () => {
    expect(mediaDescriptionText("One<br>Two &amp; Three</p><p>Four")).toBe(
      "One\nTwo & Three\n\nFour",
    );
  });

  test("removes markup before React renders the synopsis", () => {
    expect(mediaDescriptionText('<img src=x onerror="alert(1)">Safe')).toBe("Safe");
  });

  test("handles missing and invalid numeric entities", () => {
    expect(mediaDescriptionText(null)).toBe("No synopsis available.");
    expect(mediaDescriptionText("&#999999999;")).toBe("&#999999999;");
  });
});

describe("mediaImageClass", () => {
  test("uses monochrome styling only for manga", () => {
    expect(mediaImageClass("ANIME")).toBeUndefined();
    expect(mediaImageClass("MANGA")).toBe("grayscale opacity-90");
  });
});

describe("formatExternalLinks", () => {
  test("deduplicates URLs and disambiguates repeated sites by language", () => {
    expect(
      formatExternalLinks([
        { url: "https://webtoons.com/en", site: "WEBTOON", language: "English" },
        { url: "https://webtoons.com/fr", site: "WEBTOON", language: "French" },
        { url: "https://webtoons.com/en", site: "WEBTOON", language: "English" },
        { url: "https://webtoons.com/legacy", site: "WEBTOON" },
        { url: "https://naver.com", site: "Naver Webtoon", language: "Korean" },
        { url: "https://legacy.example", site: "Legacy", language: null },
      ]),
    ).toEqual([
      {
        url: "https://webtoons.com/en",
        site: "WEBTOON",
        language: "English",
        label: "WEBTOON (English)",
      },
      {
        url: "https://webtoons.com/fr",
        site: "WEBTOON",
        language: "French",
        label: "WEBTOON (French)",
      },
      {
        url: "https://webtoons.com/legacy",
        site: "WEBTOON",
        label: "WEBTOON",
      },
      {
        url: "https://naver.com",
        site: "Naver Webtoon",
        language: "Korean",
        label: "Naver Webtoon",
      },
      {
        url: "https://legacy.example",
        site: "Legacy",
        language: null,
        label: "Legacy",
      },
    ]);
  });
});

describe("media metadata formatting", () => {
  test("formats every useful fuzzy date precision without inventing missing parts", () => {
    expect(formatFuzzyDate({ year: 2024, month: 5, day: 12 })).toBe("May 12, 2024");
    expect(formatFuzzyDate({ year: 2024, month: 5, day: null })).toBe("May 2024");
    expect(formatFuzzyDate({ year: 2024, month: null, day: null })).toBe("2024");
    expect(formatFuzzyDate({ year: null, month: 5, day: 12 })).toBe("May 12");
    expect(formatFuzzyDate({ year: null, month: 5, day: null })).toBe("May");
    expect(formatFuzzyDate({ year: 2024, month: null, day: 12 })).toBe("Day 12, 2024");
    expect(formatFuzzyDate({ year: null, month: null, day: 12 })).toBe("Day 12");
    expect(formatFuzzyDate({ year: null, month: null, day: null })).toBeNull();
    expect(formatFuzzyDate(null)).toBeNull();
  });

  test("makes AniList enum and country values readable", () => {
    expect(formatMediaSource("LIGHT_NOVEL")).toBe("Light novel");
    expect(formatCountry("JP")).toBe("Japan");
    expect(formatCountry(null)).toBeNull();
    expect(formatCountry("not-a-country")).toBeNull();
  });
});
