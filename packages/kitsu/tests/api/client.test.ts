import { describe, expect, test } from "vitest";

import { buildQueryString } from "../../src/client";

describe("buildQueryString", () => {
  test("percent-encodes JSON:API bracket params and values", () => {
    expect(
      buildQueryString({
        "page[limit]": 20,
        "filter[text]": "cowboy bebop & co",
        "filter[nsfw]": false,
        include: "categories,streamingLinks",
      }),
    ).toBe(
      "page%5Blimit%5D=20&filter%5Btext%5D=cowboy%20bebop%20%26%20co&filter%5Bnsfw%5D=false&include=categories%2CstreamingLinks",
    );
  });

  test("drops null and undefined params", () => {
    expect(buildQueryString({ "filter[nsfw]": undefined, keep: "1", gone: null })).toBe("keep=1");
    expect(buildQueryString({})).toBe("");
  });
});
