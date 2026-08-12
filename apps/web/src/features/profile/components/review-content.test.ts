import { describe, expect, test } from "bun:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { ReviewContent } from "./review-content";

describe("ReviewContent", () => {
  test("renders GitHub-flavored Markdown", () => {
    const html = renderToStaticMarkup(createElement(ReviewContent, { content: "~~spoiler~~" }));

    expect(html).toContain("<del>spoiler</del>");
  });

  test("does not render raw HTML or Markdown images", () => {
    const html = renderToStaticMarkup(
      createElement(ReviewContent, {
        content: "<script>alert(1)</script>\n\n![GIF](https://example.com/image.gif)",
      }),
    );

    expect(html).not.toContain("<script>");
    expect(html).not.toContain("<img");
  });
});
