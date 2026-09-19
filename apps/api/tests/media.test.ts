import { beforeEach, describe, expect, test, vi } from "vitest";
import { Elysia } from "elysia";

const getMediaById = vi.fn();
const searchMedia = vi.fn();
const listTrending = vi.fn();

vi.mock("@tsuki/db", () => ({
  MEDIA_TYPES: ["ANIME", "MANGA"],
  MEDIA_FORMATS: [
    "TV",
    "TV_SHORT",
    "MOVIE",
    "SPECIAL",
    "OVA",
    "ONA",
    "MUSIC",
    "MANGA",
    "NOVEL",
    "ONE_SHOT",
  ],
  MEDIA_STATUSES: ["FINISHED", "RELEASING", "NOT_YET_RELEASED", "CANCELLED", "HIATUS"],
  mediaDal: {
    getMediaById: (...args: unknown[]) => getMediaById(...args),
    searchMedia: (...args: unknown[]) => searchMedia(...args),
    listTrending: (...args: unknown[]) => listTrending(...args),
  },
}));

const { mediaRoutes } = await import("../src/modules/media");
const { ensureMedia } = await import("../src/modules/media/service");

const compactRow = (id: number) => ({
  id,
  type: "ANIME",
  titleRomaji: "Cowboy Bebop",
  titleEnglish: "Cowboy Bebop",
  titleNative: "カウボーイビバップ",
  coverImageExtraLarge: "https://example.com/xl.png",
  coverImageLarge: "https://example.com/l.png",
  coverImageColor: null,
  bannerImage: null,
  format: "TV",
  episodes: 26,
  chapters: null,
  seasonYear: 1998,
  averageScore: 86,
});

const app = new Elysia().use(mediaRoutes);

beforeEach(() => {
  getMediaById.mockReset();
  searchMedia.mockReset();
  listTrending.mockReset();
});

describe("GET /media/:type/search", () => {
  test("queries our dal with the trimmed term and defaults", async () => {
    searchMedia.mockResolvedValue([compactRow(1)]);

    const res = await app.handle(new Request("http://localhost/media/ANIME/search?q=bebop"));

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual([compactRow(1)]);
    expect(searchMedia).toHaveBeenCalledWith("ANIME", "bebop", {
      limit: 24,
      includeNsfw: false,
    });
  });

  test("clamps limit to the cap", async () => {
    searchMedia.mockResolvedValue([]);

    await app.handle(new Request("http://localhost/media/ANIME/search?q=bebop&limit=100"));

    expect(searchMedia).toHaveBeenCalledWith("ANIME", "bebop", {
      limit: 50,
      includeNsfw: false,
    });
  });

  test("passes the nsfw flag through", async () => {
    searchMedia.mockResolvedValue([]);

    await app.handle(new Request("http://localhost/media/MANGA/search?q=bebop&nsfw=true"));

    expect(searchMedia).toHaveBeenCalledWith("MANGA", "bebop", {
      limit: 24,
      includeNsfw: true,
    });
  });

  test("a short query returns an empty list without hitting the dal", async () => {
    for (const q of ["", "c", "  c  "]) {
      const res = await app.handle(
        new Request(`http://localhost/media/ANIME/search?q=${encodeURIComponent(q)}`),
      );
      expect(res.status).toBe(200);
      expect(await res.json()).toEqual([]);
    }
    expect(searchMedia).not.toHaveBeenCalled();
  });
});

describe("GET /media/:type/trending", () => {
  test("serves the local popularity ranking, no upstream call", async () => {
    listTrending.mockResolvedValue([compactRow(1), compactRow(2)]);

    const res = await app.handle(new Request("http://localhost/media/ANIME/trending"));

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual([compactRow(1), compactRow(2)]);
    expect(listTrending).toHaveBeenCalledWith("ANIME", 70);
  });
});

describe("ensureMedia", () => {
  test("returns the catalogue row", async () => {
    const row = { id: 1, type: "ANIME" };
    getMediaById.mockResolvedValue(row);

    expect(await ensureMedia("ANIME", 1)).toBe(row);
    expect(getMediaById).toHaveBeenCalledWith("ANIME", 1);
  });

  test("unknown media is null — no remote fetch", async () => {
    getMediaById.mockResolvedValue(null);

    expect(await ensureMedia("ANIME", 999_999)).toBeNull();
    expect(getMediaById).toHaveBeenCalledTimes(1);
  });
});
