import { readFileSync } from "node:fs";
import { afterEach, expect, test, vi } from "vitest";

import { kitsuMediaById, kitsuPage, kitsuRecentPage } from "../../src/api";

const anime = JSON.parse(
  readFileSync(new URL("../fixtures/anime-1.json", import.meta.url), "utf8"),
);

afterEach(() => vi.unstubAllGlobals());

test("detail, bootstrap and incremental requests include the streaming platform", async () => {
  const fetchMock = vi.fn(async (_url: string | URL | Request) => Response.json(anime));
  vi.stubGlobal("fetch", fetchMock);

  await kitsuMediaById("ANIME", 1);
  await kitsuPage("ANIME", 0);
  await kitsuRecentPage("ANIME", 0);

  for (const [url] of fetchMock.mock.calls) {
    expect(new URL(String(url)).searchParams.get("include")).toBe(
      "categories,streamingLinks.streamer",
    );
  }
});

test("manga requests do not ask for unsupported streaming relationships", async () => {
  const fetchMock = vi.fn(async (_url: string | URL | Request) =>
    Response.json({ data: [], included: [] }),
  );
  vi.stubGlobal("fetch", fetchMock);

  await kitsuPage("MANGA", 0);
  await kitsuRecentPage("MANGA", 0);

  for (const [url] of fetchMock.mock.calls) {
    expect(new URL(String(url)).searchParams.get("include")).toBe("categories");
  }
});
